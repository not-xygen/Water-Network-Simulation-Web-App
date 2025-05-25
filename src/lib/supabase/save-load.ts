import type { SimulationSave, SimulationSaveFormData } from "@/types/save-load";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSimulationSaves(
  userId: string,
  client: SupabaseClient,
) {
  const { data, error } = await client
    .from("simulation_saves")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SimulationSave[];
}

export async function getSimulationSave(id: string, client: SupabaseClient) {
  const { data, error } = await client
    .from("simulation_saves")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as SimulationSave;
}

export async function createSimulationSave(
  userId: string,
  saveData: SimulationSaveFormData,
  client: SupabaseClient,
) {
  if (typeof userId !== "string") {
    throw new Error("userId harus string");
  }

  if (typeof saveData.metadata !== "object") {
    throw new Error("metadata harus object");
  }

  const { data, error } = await client
    .from("simulation_saves")
    .insert([
      {
        user_id: userId,
        name: saveData.name,
        screenshot: saveData.screenshot,
        metadata: saveData.metadata,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR:", error);
    throw error;
  }
  return data as SimulationSave;
}

export async function updateSimulationSave(
  id: string,
  saveData: SimulationSaveFormData,
  client: SupabaseClient,
) {
  const { data, error } = await client
    .from("simulation_saves")
    .update({
      name: saveData.name,
      screenshot: saveData.screenshot,
      metadata: saveData.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SimulationSave;
}

export async function deleteSimulationSave(id: string, client: SupabaseClient) {
  const { error } = await client.from("simulation_saves").delete().eq("id", id);
  if (error) throw error;
}
