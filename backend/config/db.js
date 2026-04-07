const { createClient } = require("@supabase/supabase-js");

let supabase = null;
let isConnected = false;

const connectDB = async () => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log("Supabase credentials not configured - running in offline mode");
      isConnected = false;
      return;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase Connected");
    isConnected = true;
  } catch (error) {
    console.log("Supabase connection failed - running in offline mode");
    console.error('Supabase Error Details:', error.message);
    isConnected = false;
  }
};

const getConnectionStatus = () => isConnected;
const getSupabase = () => supabase;

module.exports = { connectDB, getConnectionStatus, getSupabase };

