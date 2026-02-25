import api from "../api/axios";

const khqrService = {
  async generateKhqr(userId, amount) {
    const endpoint = userId
      ? `/khqr/orders/${userId}/generate_qrcode`
      : "/khqr/orders/generate_qrcode";
    return api.post(endpoint, { amount });
  },

  async checkPayment(userId, qrMd5) {
    const endpoint = userId
      ? `/khqr/orders/${userId}/check_payment`
      : "/khqr/orders/check_payment";
    return api.post(endpoint, {
      qr_md5: qrMd5,
    });
  },
};

export default khqrService;
