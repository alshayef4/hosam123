import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log("Setting up Supabase database...");

    // Tables should be created in Supabase dashboard
    // We'll just insert data into existing tables

    // Insert sample customers
    console.log("Inserting sample customers...");
    const customers = [
      {
        full_name: "أحمد محمد علي",
        phone_number: "0501234567",
        notes: "عميل منتظم",
        is_active: true,
      },
      {
        full_name: "فاطمة عبدالله حسن",
        phone_number: "0502345678",
        notes: "عميل جديد",
        is_active: true,
      },
      {
        full_name: "محمود سالم إبراهيم",
        phone_number: "0503456789",
        notes: "",
        is_active: true,
      },
      {
        full_name: "نور خالد محمود",
        phone_number: "0504567890",
        notes: "عميل VIP",
        is_active: true,
      },
      {
        full_name: "سارة يوسف أحمد",
        phone_number: "0505678901",
        notes: "",
        is_active: true,
      },
    ];

    const { data: insertedCustomers, error: customersInsertError } =
      await supabase.from("customers").insert(customers).select();

    if (customersInsertError) {
      console.log(
        "Note: Customers table might not exist yet. Error:",
        customersInsertError.message
      );
    } else {
      console.log("✓ Inserted", insertedCustomers?.length || 0, "customers");
    }

    // Create sample ledgers
    console.log("Inserting sample ledgers...");
    const ledgers = [
      {
        title: "دفتر شهر مايو 2024",
        month_year: "2024-05-01",
        is_active: true,
        created_at: new Date("2024-05-01").toISOString(),
      },
      {
        title: "دفتر شهر يونيو 2024",
        month_year: "2024-06-01",
        is_active: true,
        created_at: new Date("2024-06-01").toISOString(),
      },
      {
        title: "دفتر شهر يوليو 2024",
        month_year: "2024-07-01",
        is_active: true,
        created_at: new Date("2024-07-01").toISOString(),
      },
    ];

    const { data: insertedLedgers, error: ledgersInsertError } = await supabase
      .from("ledgers")
      .insert(ledgers)
      .select();

    if (ledgersInsertError) {
      console.log(
        "Note: Ledgers table might not exist yet. Error:",
        ledgersInsertError.message
      );
    } else {
      console.log("✓ Inserted", insertedLedgers?.length || 0, "ledgers");
    }

    // Create sample payments
    if (insertedCustomers && insertedLedgers) {
      console.log("Inserting sample payments...");
      const payments = [];

      for (const ledger of insertedLedgers) {
        for (const customer of insertedCustomers) {
          payments.push({
            customer_id: customer.id,
            ledger_id: ledger.id,
            is_paid: Math.random() > 0.3, // 70% paid
            payment_date: Math.random() > 0.3 ? new Date().toISOString() : null,
            notes: Math.random() > 0.7 ? "دفعة متأخرة" : null,
          });
        }
      }

      const { data: insertedPayments, error: paymentsInsertError } =
        await supabase.from("payments").insert(payments).select();

      if (paymentsInsertError) {
        console.log(
          "Note: Payments table might not exist yet. Error:",
          paymentsInsertError.message
        );
      } else {
        console.log("✓ Inserted", insertedPayments?.length || 0, "payments");
      }
    }

    console.log("\n✓ Database setup completed successfully!");
    console.log(
      "\nNote: If tables don't exist, please create them in Supabase dashboard:"
    );
    console.log(
      "- customers (id, full_name, phone_number, notes, is_active, created_at)"
    );
    console.log("- ledgers (id, title, month_year, is_active, created_at)");
    console.log(
      "- payments (id, customer_id, ledger_id, is_paid, payment_date, notes)"
    );
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();
