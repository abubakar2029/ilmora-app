"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveAdminBlog,
  deleteAdminBlog,
  deleteAdminUser,
  fetchAdminOverview,
  getAdminBlog,
  listAdminBlogs,
  listAdminUsers,
  reviseAdminBlog,
  sendAdminAnnouncement,
  updateAdminUser,
} from "@/lib/admin-api";
import { queryKeys } from "@/lib/query-keys";

const ADMIN_PAGE_SIZE = 20;

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: fetchAdminOverview,
    staleTime: 60 * 1000,
  });
}

export function useAdminBlogs(params: {
  status?: string;
  search: string;
  page: number;
}) {
  return useQuery({
    queryKey: queryKeys.admin.blogs(params),
    queryFn: () =>
      listAdminBlogs({
        status: params.status,
        search: params.search,
        page: params.page,
        pageSize: ADMIN_PAGE_SIZE,
      }),
    staleTime: 30 * 1000,
  });
}

export function useAdminBlog(id: number | null) {
  return useQuery({
    queryKey: queryKeys.admin.blog(id ?? 0),
    queryFn: () => getAdminBlog(id!),
    enabled: id != null && id > 0,
  });
}

export function useAdminUsers(params: {
  role: string;
  search: string;
  page: number;
}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () =>
      listAdminUsers({
        role: params.role,
        search: params.search,
        page: params.page,
        pageSize: ADMIN_PAGE_SIZE,
      }),
    staleTime: 30 * 1000,
  });
}

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const approveBlog = useMutation({
    mutationFn: (id: number) => approveAdminBlog(id),
    onSuccess: invalidateAll,
  });

  const deleteBlog = useMutation({
    mutationFn: (id: number) => deleteAdminBlog(id),
    onSuccess: invalidateAll,
  });

  const reviseBlog = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) => reviseAdminBlog(id, comment),
    onSuccess: invalidateAll,
  });

  const updateUser = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateAdminUser>[1];
    }) => updateAdminUser(id, payload),
    onSuccess: invalidateAll,
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: invalidateAll,
  });

  const sendAnnouncement = useMutation({
    mutationFn: sendAdminAnnouncement,
    onSuccess: invalidateAll,
  });

  return {
    approveBlog,
    deleteBlog,
    reviseBlog,
    updateUser,
    deleteUser,
    sendAnnouncement,
    ADMIN_PAGE_SIZE,
  };
}
