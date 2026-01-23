export const hasModule = (permissions: Record<string, unknown> | undefined, module: string) =>
    permissions?.[module] === true;
  
export const hasAction = (
  permissions: Record<string, unknown> | undefined,
  module: string,
  action: "create" | "read" | "update" | "delete"
) => {
  if (!permissions) return false;
  if (permissions.role === "HealthcareAdmin") return true;

  const normalize = {
    managePlatformStaffs: "platformStaffActions",
    manageFacilities: "facilitiesActions",
  } as Record<string, string>;

  const actionsKey = normalize[module];

  if (actionsKey) {
    if (permissions[module] && !permissions[actionsKey]) {
      return true; 
    }
    return (
      permissions[module] &&
      permissions[actionsKey]?.[action] === true
    );
  }

  const base = module.replace("manage", "");
  const actionKey = `${base.charAt(0).toLowerCase()}${base.slice(1)}Actions`;

  return permissions[module] && permissions[actionKey]?.[action];
};

