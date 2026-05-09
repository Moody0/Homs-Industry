export type AdminActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export const initialAdminActionState: AdminActionResult = {
  message: "",
  success: false,
};
