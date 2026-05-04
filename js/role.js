/**
 * Super Admin = work email domain (change SUPER_ADMIN_DOMAIN for your org).
 */
(function (global) {
  var SUPER_ADMIN_DOMAIN = "@kgprotech.com";

  function isSuperAdminEmail(email) {
    var e = (email || "").trim().toLowerCase();
    var d = SUPER_ADMIN_DOMAIN.toLowerCase();
    return e.length > d.length && e.endsWith(d);
  }

  function applyRoleFromEmail(email) {
    var yes = isSuperAdminEmail(email);
    try {
      sessionStorage.setItem("kgapp_is_super_admin", yes ? "1" : "0");
      sessionStorage.setItem("kgapp_user_email", (email || "").trim().toLowerCase());
    } catch (err) {}
    return yes;
  }

  function readIsSuperAdmin() {
    try {
      return sessionStorage.getItem("kgapp_is_super_admin") === "1";
    } catch (e) {
      return false;
    }
  }

  function readUserEmail() {
    try {
      return sessionStorage.getItem("kgapp_user_email") || "";
    } catch (e) {
      return "";
    }
  }

  global.KGAPP = global.KGAPP || {};
  global.KGAPP.superAdminDomain = SUPER_ADMIN_DOMAIN;
  global.KGAPP.isSuperAdminEmail = isSuperAdminEmail;
  global.KGAPP.applyRoleFromEmail = applyRoleFromEmail;
  global.KGAPP.readIsSuperAdmin = readIsSuperAdmin;
  global.KGAPP.readUserEmail = readUserEmail;
})(typeof window !== "undefined" ? window : this);
