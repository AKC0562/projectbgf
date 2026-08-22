import { LogOut } from "lucide-react";

import Button from "../common/Button";

function LogoutButton({
  onLogout,
  loading = false,
}) {
  return (
    <Button
      variant="secondary"
      onClick={onLogout}
      loading={loading}
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
}

export default LogoutButton;