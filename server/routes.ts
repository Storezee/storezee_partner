import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });


const pool = new Pool({
  host: process.env.host,
  port: parseInt(process.env.port || "5533"),
  database: process.env.database,
  user: process.env.user,
  password: process.env.password,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // GET user role (kept from your earlier version)
  app.get("/api/user-role/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const result = await pool.query(
        'SELECT id, full_name, email, phone, role, profile_picture FROM users_user WHERE phone = $1',
        [phone]
      );

      if (result.rows.length > 0) {
        res.json({
          success: true,
          data: result.rows[0],
        });
      } else {
        res.json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch user role",
      });
    }
  });

  // POST create-everything -> ported from your Python implementation
  app.post(
    "/api/create-everything",
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "luggage_pic", maxCount: 10 },
    ]),
    async (req, res) => {
      const client = await pool.connect();
      try {
        // Extract fields from body
        const {
          full_name,
          email,
          phone,
          storage_unit_id,
          booking_created_time,
          storage_booked_location,
          latitude,
          longitude,
          user_remark = "",
          luggage_time = "6",
          addons = "",
          identification_number = "",
          amount = "0"   
        } = req.body as Record<string, string>;

        // Multer files are in memory
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        await client.query("BEGIN");

        const now = new Date();

        // 1) Create user
        const user_id = randomUUID();
        await client.query(
          `INSERT INTO users_user (
                password, last_login, is_superuser, id, created_at, updated_at,
                full_name, email, phone, role, latitude, longitude, is_active,
                is_staff, date_joined, profile_picture, is_verified, otp,
                otp_generated_time, city_name, identification_number
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,
                $7,$8,$9,$10,$11,$12,$13,
                $14,$15,$16,$17,$18,$19,$20,$21
            )`,
          [
            "", // password
            null, // last_login
            false, // is_superuser
            user_id,
            now,
            now,
            full_name,
            email,
            phone,
            "user",
            latitude ? parseFloat(latitude) : null,
            longitude ? parseFloat(longitude) : null,
            true, // is_active
            false, // is_staff
            now, // date_joined
            `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 99) + 1}.png`,
            true, // is_verified
            null, // otp
            now, // otp_generated_time
            storage_booked_location,
            identification_number,
          ]
        );

        // 2) Save uploaded files to uploads/ (document and luggage)
        // Ensure uploads directory exists
        const uploadsRoot = path.resolve(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

        // Save single document file if present (field name 'file')
        // (Note: in Python code this was commented out; leaving saved doc capability)
        if (files?.file && files.file[0]) {
          const f = files.file[0];
          const ext = f.originalname.split(".").pop() || "bin";
          const docKey = `documents/${user_id}/${randomUUID()}.${ext}`;
          const docPath = path.join(uploadsRoot, docKey);
          fs.mkdirSync(path.dirname(docPath), { recursive: true });
          fs.writeFileSync(docPath, f.buffer);
          // optional: you can insert doc record into users_userdocument table if you want
        }

        // Save luggage pics
        const luggage_urls: string[] = [];
        if (files?.luggage_pic && files.luggage_pic.length > 0) {
          for (const pic of files.luggage_pic) {
            const ext = pic.originalname.split(".").pop() || "jpg";
            const imgKey = `luggage/${user_id}/${randomUUID()}.${ext}`;
            const imgPath = path.join(uploadsRoot, imgKey);
            fs.mkdirSync(path.dirname(imgPath), { recursive: true });
            fs.writeFileSync(imgPath, pic.buffer);
            luggage_urls.push(`/static/${imgKey}`);
          }
        }

        const luggage_json = JSON.stringify(luggage_urls);

        // 3) Create booking
        const booking_no = "BK" + randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
        const start_dt = booking_created_time ? new Date(booking_created_time) : new Date();
        const booking_end = new Date(start_dt.getTime() + Number(luggage_time) * 60 * 60 * 1000);
        const booking_str_id = randomUUID();
        const finalAmount = amount ? Number(amount) : 0;

        const insertBookingText = `
          INSERT INTO public.storage_bookings_storagebooking
          (id, created_at, updated_at, booking_id, booking_type, booking_created_time, booking_end_time, status, storage_image_url, storage_weight, is_active,
           storage_latitude, storage_longitude, storage_booked_location, user_remark, assigned_saathi_id, storage_unit_id,
           user_booked_id, amount, luggage_rakshak_id, storage_location_updated_at, delivered_to_rakshak_at, luggage_images, pickup_confirmed_at,
           return_address, return_estimated_amount, return_lat, return_lng, return_preferred_time, return_requested_at, last_updated_by, amount_updated_by, payment_status
          )
          VALUES (
  $1,$2,$3,$4,$5,
  $6,$7,$8,$9,$10,
  $11,$12,$13,$14,
  $15,$16,$17,$18,
  $19,$20,$21,$22,$23,
  $24,$25,$26,$27,$28,
  $29,$30,$31,$32, $33
)

          RETURNING id;
        `;

        const insertBookingValues = [
          booking_str_id,
          now,
          now,
          booking_no,
          "Hourly",
          start_dt,
          booking_end,
          "confirmed",
          luggage_urls.length > 0 ? luggage_urls[0] : "",
          null,
          true,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          storage_booked_location,
          user_remark,
          null,
          storage_unit_id,
          user_id,
          finalAmount, // amount (hardcoded like in your Python)
          null,
          null,
          null,
          luggage_json,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          "System",
          null,
          "pending"
        ];

        // const bookingResult = await client.query(insertBookingText, insertBookingValues);
        const bookingResult = await (async () => {
          console.log("--------------------------------------------------");
          console.log("🔍 DEBUGGING BOOKING INSERT");

          // Count placeholders ($1, $2, etc.)
          const placeholderCount =
            insertBookingText.match(/\$\d+/g)?.length ?? 0;

          console.log("📌 Placeholder Count:", placeholderCount);
          console.log("📌 insertBookingValues Count:", insertBookingValues.length);

          console.log("\n📄 SQL Query:\n", insertBookingText);
          console.log("\n📦 VALUES:\n", insertBookingValues);
          console.log("--------------------------------------------------");

          return await client.query(insertBookingText, insertBookingValues);
        })();
        const booking_id = bookingResult.rows[0]?.id;

        // 4) Addons: if provided as comma-separated string
        if (addons && addons.toString().trim()) {
          const addList = addons.toString().split(",").map((s) => s.trim()).filter(Boolean);
          for (const addonStr of addList) {
            const addonRowId = randomUUID();
            await client.query(
              `INSERT INTO public.storage_bookings_bookingaddon
                (id, created_at, updated_at, addon_id, booking_id, addon_str_id, booking_str_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7);`,
              [addonRowId, now, now, null, null, addonStr, booking_id]
            );
          }
        }

        await client.query("COMMIT");

        return res.json({
          success: true,
          message: "Everything created successfully!",
          data: {
            user_id,
            booking_id,
            luggage_images: luggage_urls,
          },
        });
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("Error in create-everything:", e);
        return res.status(500).json({ success: false, error: (e as Error).message || String(e) });
      } finally {
        client.release();
      }
    }
  );

  // GET user bookings by phone (ported SQL)
  app.get("/api/user-bookings/:phone", async (req, res) => {
    const { phone } = req.params;
    let client;
    try {
      client = await pool.connect();

      const query = `
            SELECT 
              sb.id,
              sb.user_booked_id,
              sb.storage_unit_id,
              sb.booking_id,
              sb.booking_type,
              sb.booking_created_time,
              sb.booking_end_time,
              sb.status,
             
              sb.amount,
              sb.storage_latitude,
              sb.storage_longitude,
              sb.storage_booked_location,
              sb.pickup_confirmed_at,
              sb.storage_location_updated_at,
              sb.user_remark,
              
              sb.last_updated_by,
              sb.amount_updated_by,
              sb.created_at,
              sb.updated_at,
              sb.payment_status,

              -- User details
              u.id as user_id,
              u.full_name as user_full_name,
              u.email as user_email,
              u.phone as user_phone,

              -- Storage unit details
              su.id as storage_id,
              su.title as storage_title,
              su.description as storage_description,
              su.address as storage_address,
              su.city as storage_city,
              su.state as storage_state,
              su.pincode as storage_pincode,
              su.latitude as storage_lat,
              su.longitude as storage_lng,
              su.rating as storage_rating,

              -- Addon details
              COALESCE(
        json_agg(
            jsonb_build_object(
                'addon_id', sua.id,
                'name', sua.name,
                'price', sua.base_price
            )
        ) FILTER (WHERE sua.id IS NOT NULL),
        '[]'
    ) AS addons

            FROM storage_bookings_storagebooking sb
            INNER JOIN users_user u ON sb.user_booked_id = u.id
            LEFT JOIN storage_units_storageunit su ON sb.storage_unit_id = su.id
            LEFT JOIN saathi_saathi s ON sb.assigned_saathi_id = s.id
            LEFT JOIN storage_bookings_bookingaddon sbb 
    ON (
        sbb.booking_id = sb.id 
        OR sbb.booking_str_id = sb.id::text
    )

LEFT JOIN storage_units_addon sua 
    ON (
        sua.id = sbb.addon_id
        OR sbb.addon_str_id = sua.id::text
    )
            
            WHERE u.phone = $1
            GROUP BY 
    sb.id, sb.user_booked_id, sb.storage_unit_id, sb.booking_id, sb.booking_type,
    sb.booking_created_time, sb.booking_end_time, sb.status, sb.amount,
    sb.storage_latitude, sb.storage_longitude, sb.storage_booked_location,
    sb.pickup_confirmed_at, sb.storage_location_updated_at, sb.user_remark,
    sb.last_updated_by, sb.amount_updated_by, sb.created_at, sb.updated_at,
    
    u.id, u.full_name, u.email, u.phone,

    su.id, su.title, su.description, su.address, su.city, su.state,
    su.pincode, su.latitude, su.longitude, su.rating

            ORDER BY sb.created_at DESC
        `;

      const result = await client.query(query, [phone]);
      const data = result.rows;

      return res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (e) {
      console.error("Error fetching user bookings:", e);
      return res.status(500).json({ success: false, message: (e as Error).message || String(e) });
    } finally {
      client?.release();
    }
  });

  // GET storage bookings by storage unit id (ported SQL + summary)
  app.get("/api/storage-bookings/:storage_unit_id", async (req, res) => {
    const { storage_unit_id } = req.params;
    let client;
    try {
      client = await pool.connect();

      const query = `
            SELECT 
              sb.id,
              sb.user_booked_id,
              sb.storage_unit_id,
              sb.booking_id,
              sb.booking_type,
              sb.booking_created_time,
              sb.booking_end_time,
              sb.status,
              sb.storage_image_url,
              sb.luggage_images,
             
              sb.amount,
              sb.storage_latitude,
              sb.storage_longitude,
              sb.storage_booked_location,
              sb.pickup_confirmed_at,
              sb.storage_location_updated_at,
              sb.user_remark,
              
              sb.last_updated_by,
              sb.amount_updated_by,
              sb.created_at,
              sb.updated_at,
              sb.payment_status,

              -- User details
              u.id as user_id,
              u.full_name as user_full_name,
              u.email as user_email,
              u.phone as user_phone,

              -- Storage unit details
              su.id as storage_id,
              su.title as storage_title,
              su.description as storage_description,
              su.address as storage_address,
              su.city as storage_city,
              su.state as storage_state,
              su.pincode as storage_pincode,
              su.latitude as storage_lat,
              su.longitude as storage_lng,
              

              -- Addon details
              COALESCE(
        json_agg(
            jsonb_build_object(
                'addon_id', sua.id,
                'name', sua.name,
                'price', sua.base_price
            )
        ) FILTER (WHERE sua.id IS NOT NULL),
        '[]'
    ) AS addons

            FROM storage_bookings_storagebooking sb
            INNER JOIN users_user u ON sb.user_booked_id = u.id
            LEFT JOIN storage_units_storageunit su ON sb.storage_unit_id = su.id
            LEFT JOIN saathi_saathi s ON sb.assigned_saathi_id = s.id
            LEFT JOIN storage_bookings_bookingaddon sbb 
    ON (
        sbb.booking_id = sb.id 
        OR sbb.booking_str_id = sb.id::text
    )

LEFT JOIN storage_units_addon sua 
    ON (
        sua.id = sbb.addon_id
        OR sbb.addon_str_id = sua.id::text
    )
            
            WHERE sb.storage_unit_id = $1
            GROUP BY 
    sb.id, sb.user_booked_id, sb.storage_unit_id, sb.booking_id, sb.booking_type,
    sb.booking_created_time, sb.booking_end_time, sb.status, sb.amount,
    sb.storage_latitude, sb.storage_longitude, sb.storage_booked_location,
    sb.pickup_confirmed_at, sb.storage_location_updated_at, sb.user_remark,
    sb.last_updated_by, sb.amount_updated_by, sb.created_at, sb.updated_at,
    
    u.id, u.full_name, u.email, u.phone,

    su.id, su.title, su.description, su.address, su.city, su.state,
    su.pincode, su.latitude, su.longitude, su.rating

            ORDER BY sb.created_at DESC
        `;

      const result = await client.query(query, [storage_unit_id]);
      const data = result.rows;

      // SUMMARY
      const summaryQuery = `
        SELECT 
            COUNT(*) AS total_bookings,
            COALESCE(SUM(CAST(sb.amount AS DECIMAL)), 0) AS total_amount,
            COALESCE(SUM(
                CASE WHEN sb.payment_status = 'paid' THEN CAST(sb.amount AS DECIMAL) END
            ), 0) AS total_paid_amount
        FROM storage_bookings_storagebooking sb
        WHERE sb.storage_unit_id = $1;
      `;

      const summaryRes = await client.query(summaryQuery, [storage_unit_id]);
      const summary = summaryRes.rows[0] || { total_bookings: 0, total_amount: 0, total_paid_amount: 0 };

      return res.json({
        success: true,
        count: data.length,
        summary,
        data,
      });
    } catch (e) {
      console.error("Error fetching storage bookings:", e);
      return res.status(500).json({ success: false, message: (e as Error).message || String(e) });
    } finally {
      client?.release();
    }
  });

  // GET storage units
  app.get("/api/storage-units/", async (_req, res) => {
    let client;
    try {
      client = await pool.connect();
      const q = `select sus.id, sus.title from storage_units_storageunit sus`;
      const r = await client.query(q);
      return res.json({
        success: true,
        data: r.rows,
      });
    } catch (e) {
      console.error("Error fetching storage units:", e);
      return res.status(500).json({ success: false, message: (e as Error).message || String(e) });
    } finally {
      client?.release();
    }
  });

  // GET storage units
  app.get("/api/addons", async (_req, res) => {
    console.log("📢 /api/addons route LOADED");

    let client;
    try {
      client = await pool.connect();

      const q = `
        SELECT id, name, base_price, description
        FROM public.storage_units_addon
        WHERE is_active = TRUE;
      `;

      const r = await client.query(q);

      console.log("Fetched addons:", r.rows);

      return res.json({
        success: true,
        data: r.rows,
      });

    } catch (e) {
      console.error("Error fetching addons:", e);
      return res.status(500).json({
        success: false,
        message: (e as Error).message || "Server error",
      });
    } finally {
      client?.release();
    }
  });


  // create and return a http server for runApp() to listen on
  const httpServer = createServer(app);
  return httpServer;
}
