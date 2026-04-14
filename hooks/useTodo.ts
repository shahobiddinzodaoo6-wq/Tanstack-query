import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IData, IEditTodo, IResponse } from "../types/todo";

const BASE_URL = "http://37.27.29.18:8001";

// ─── Fetcher helpers ──────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

// ─── GET all todos ────────────────────────────────────────────────────────────

export function useGetTodos() {
    return useQuery<IResponse>({
        queryKey: ["todos"],
        queryFn: () => fetchJson<IResponse>(`${BASE_URL}/api/to-dos`),
    });
}

// ─── GET single todo by id ────────────────────────────────────────────────────

export function useGetTodoById(id: number) {
    return useQuery<IData>({
        queryKey: ["todo", id],
        queryFn: () => fetchJson<IData>(`${BASE_URL}/api/to-dos/${id}`),
        enabled: !!id,
    });
}

// ─── DELETE todo ──────────────────────────────────────────────────────────────

export function useDeleteTodo() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, number>({
        mutationFn: async (id: number) => {
            const res = await fetch(`${BASE_URL}/api/to-dos/?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

// ─── PUT check/toggle status ──────────────────────────────────────────────────

export function useCheckStatus() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, number>({
        mutationFn: async (id: number) => {
            const res = await fetch(`${BASE_URL}/completed?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id),
            });
            if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

// ─── POST add todo (with images) ─────────────────────────────────────────────

export function useAddTodo() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, FormData>({
        mutationFn: async (formData: FormData) => {
            const res = await fetch(`${BASE_URL}/api/to-dos`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(`Add failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

// ─── PUT edit todo ────────────────────────────────────────────────────────────

export function useEditTodo() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, IEditTodo>({
        mutationFn: async (obj: IEditTodo) => {
            const res = await fetch(`${BASE_URL}/api/to-dos`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
            });
            if (!res.ok) throw new Error(`Edit failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

// ─── DELETE image ─────────────────────────────────────────────────────────────

export function useDeleteImage() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, number>({
        mutationFn: async (id: number) => {
            const res = await fetch(`${BASE_URL}/api/to-dos/images/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Image delete failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}

// ─── POST add image to todo ───────────────────────────────────────────────────

export function useAddImage() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, { id: number; formData: FormData }>({
        mutationFn: async ({ id, formData }) => {
            const res = await fetch(`${BASE_URL}/api/to-dos/${id}/images`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(`Add image failed: ${res.status}`);
            return res.json().catch(() => null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });
}
