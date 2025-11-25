import { redirect } from "next/navigation";

const AdminSiteSettingsPage = async () => {
  redirect("/admin/settings/general");
};

export default AdminSiteSettingsPage;
