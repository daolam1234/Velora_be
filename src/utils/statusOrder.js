export const translateStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipped':
      return 'Đang giao hàng';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không rõ';
  }
};
