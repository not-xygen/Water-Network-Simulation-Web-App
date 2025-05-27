import { useSupabaseClient } from "@/lib/supabase/client";
import {
	createSimulationSave,
	deleteSimulationSave,
	getSimulationSave,
	getSimulationSaves,
	updateSimulationSave,
} from "@/lib/supabase/save-load";
import useNodeEdgeStore from "@/store/node-edge";
import type { SimulationSaveFormData } from "@/types/save-load";
import { useUser } from "@clerk/clerk-react";
import { useCallback, useState } from "react";

export function useSimulationSave() {
	const { user } = useUser();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const { nodes, edges } = useNodeEdgeStore();
	const supabase = useSupabaseClient();

	const loadSimulationSaves = useCallback(async () => {
		if (!user) return [];
		try {
			setLoading(true);
			setError(null);
			return await getSimulationSaves(user.id, supabase);
		} catch (err) {
			setError(err as Error);
			return [];
		} finally {
			setLoading(false);
		}
	}, [user, supabase]);

	const loadSimulationSave = useCallback(
		async (id: string) => {
			if (!user) return null;
			try {
				setLoading(true);
				setError(null);
				return await getSimulationSave(id, supabase);
			} catch (err) {
				setError(err as Error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[user, supabase],
	);

	const saveSimulation = useCallback(
		async (saveData: SimulationSaveFormData) => {
			if (!user) return null;
			try {
				setLoading(true);
				setError(null);
				return await createSimulationSave(user.id, saveData, supabase);
			} catch (err) {
				setError(err as Error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[user, supabase],
	);

	const updateSimulation = useCallback(
		async (id: string, saveData: SimulationSaveFormData) => {
			if (!user) return null;
			try {
				setLoading(true);
				setError(null);
				return await updateSimulationSave(id, saveData, supabase);
			} catch (err) {
				setError(err as Error);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[user, supabase],
	);

	const removeSimulationSave = useCallback(
		async (id: string) => {
			if (!user) return false;
			try {
				setLoading(true);
				setError(null);
				await deleteSimulationSave(id, supabase);
				return true;
			} catch (err) {
				setError(err as Error);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[user, supabase],
	);

	const prepareSaveData = useCallback(
		(name: string, screenshot: string): SimulationSaveFormData => {
			return {
				name,
				screenshot,
				metadata: {
					nodes,
					edges,
				},
			};
		},
		[nodes, edges],
	);

	return {
		loading,
		error,
		loadSimulationSaves,
		loadSimulationSave,
		saveSimulation,
		updateSimulation,
		removeSimulationSave,
		prepareSaveData,
	};
}
