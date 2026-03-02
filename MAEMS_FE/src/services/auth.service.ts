// High-level auth service built on top of auth feature APIs.

import * as authApi from "../api/auth";

export async function getCurrentUser() {
  return authApi.getCurrentUser();
}

