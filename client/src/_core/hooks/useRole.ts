import { useAuth } from "./useAuth";

export type UserRole = "user" | "member" | "admin";

export function useRole() {
  const { user, isAuthenticated, loading } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === "admin") return true;
    
    // Member has member and user permissions
    if (user.role === "member" && (role === "member" || role === "user")) return true;
    
    // User has only user permissions
    if (user.role === "user" && role === "user") return true;
    
    return false;
  };

  const isMember = (): boolean => {
    if (!user) return false;
    return user.approvalStatus === "approved" && user.paymentStatus === "confirmed";
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  const canAccessResources = (): boolean => {
    return isMember() || isAdmin();
  };

  return {
    user,
    isAuthenticated,
    loading,
    hasRole,
    isMember,
    isAdmin,
    canAccessResources,
  };
}

