import api from "./api";

export const customerService = {
  getAll: (params) => api.get("/customers", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/customers/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/customers", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/customers/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/customers/${id}`).then((res) => res.data),
};

export const productService = {
  getAll: (params) => api.get("/products", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/products/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/products", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/products/${id}`).then((res) => res.data),
};

export const serviceService = {
  getAll: () => api.get("/services").then((res) => res.data.data),
  create: (data) => api.post("/services", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/services/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/services/${id}`).then((res) => res.data),
};

export const rateService = {
  getAll: () => api.get("/rates").then((res) => res.data.data),
  getByTier: (tier) => api.get(`/rates/tier/${tier}`).then((res) => res.data.data),
  create: (data) => api.post("/rates", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/rates/${id}`, data).then((res) => res.data.data),
};

export const estimateService = {
  getAll: (params) => api.get("/estimates", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/estimates/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/estimates", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/estimates/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/estimates/${id}`).then((res) => res.data),
  convertToQuotation: (id) => api.post(`/estimates/${id}/convert-quotation`).then((res) => res.data),
};

export const quotationService = {
  getAll: (params) => api.get("/quotations", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/quotations/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/quotations", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/quotations/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/quotations/${id}`).then((res) => res.data),
  convertToProforma: (id) => api.post(`/quotations/${id}/convert-proforma`).then((res) => res.data),
};

export const proformaService = {
  getAll: (params) => api.get("/proforma-invoices", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/proforma-invoices/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/proforma-invoices", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/proforma-invoices/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/proforma-invoices/${id}`).then((res) => res.data),
  recordAdvance: (id, amount) => api.post(`/proforma-invoices/${id}/record-advance`, { amount }).then((res) => res.data),
  convertToInvoice: (id) => api.post(`/proforma-invoices/${id}/convert-invoice`).then((res) => res.data),
};

export const invoiceService = {
  getAll: (params) => api.get("/invoices", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/invoices/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/invoices", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/invoices/${id}`, data).then((res) => res.data.data),
  delete: (id) => api.delete(`/invoices/${id}`).then((res) => res.data),
  createChallan: (id, data) => api.post(`/invoices/${id}/create-challan`, data).then((res) => res.data),
};

export const challanService = {
  getAll: (params) => api.get("/delivery-challans", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/delivery-challans/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/delivery-challans", data).then((res) => res.data.data),
  update: (id, data) => api.put(`/delivery-challans/${id}`, data).then((res) => res.data.data),
  updateStatus: (id, status, recipientName) =>
    api.patch(`/delivery-challans/${id}/status`, { status, recipientName }).then((res) => res.data),
  delete: (id) => api.delete(`/delivery-challans/${id}`).then((res) => res.data),
};

export const paymentService = {
  getAll: (params) => api.get("/payments", { params }).then((res) => res.data.data),
  getById: (id) => api.get(`/payments/${id}`).then((res) => res.data.data),
  create: (data) => api.post("/payments", data).then((res) => res.data.data),
  delete: (id) => api.delete(`/payments/${id}`).then((res) => res.data),
};

export const reportService = {
  getReports: () => api.get("/reports").then((res) => res.data.data),
};

export const settingService = {
  getSettings: () => api.get("/settings").then((res) => res.data.data),
  updateSettings: (data) => api.put("/settings", data).then((res) => res.data.data),
};

export const seedService = {
  seed: () => api.post("/seed").then((res) => res.data),
};
