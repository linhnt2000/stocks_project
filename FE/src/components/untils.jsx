  // Xử lý trùng lặp dữ liệu
export const removeDuplicates = (data)=> {
    const uniqueData = [];
    const timeSet = new Set();
    
    data.forEach(item => {
      if (!timeSet.has(item.time)) {
        uniqueData.push(item);
        timeSet.add(item.time);
      }
    });
    
    return uniqueData;
}

export const getStartDate = (date) => {
    const oneMonthAgo = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
  
    // Kiểm tra nếu tháng là tháng 1, thì điều chỉnh năm và tháng để lấy tháng 12 của năm trước
    if (oneMonthAgo.getMonth() < 0) {
      oneMonthAgo.setFullYear(oneMonthAgo.getFullYear() - 1); // Năm trước
      oneMonthAgo.setMonth(11); // Tháng 12
    }
  
    return oneMonthAgo.toISOString().split('T')[0]; // Lấy ngày dưới dạng chuỗi 'yyyy-MM-dd'
};

export const getStartWeek = (date) => {
  const oneMonthAgo = new Date(date.getFullYear(), date.getMonth() - 5, date.getDate());

  // Kiểm tra nếu tháng là tháng 1, thì điều chỉnh năm và tháng để lấy tháng 12 của năm trước
  if (oneMonthAgo.getMonth() < 0) {
    oneMonthAgo.setFullYear(oneMonthAgo.getFullYear() - 1); // Năm trước
    oneMonthAgo.setMonth(11); // Tháng 12
  }

  return oneMonthAgo.toISOString().split('T')[0]; // Lấy ngày dưới dạng chuỗi 'yyyy-MM-dd'
};

// export const getStartDate = (date) => {
//   const oneMonthAgo = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());

//   // Kiểm tra nếu tháng là tháng 1, thì điều chỉnh năm và tháng để lấy tháng 12 của năm trước
//   if (oneMonthAgo.getMonth() < 0) {
//     oneMonthAgo.setFullYear(oneMonthAgo.getFullYear() - 1); // Năm trước
//     oneMonthAgo.setMonth(11); // Tháng 12
//   }

//   return oneMonthAgo.toISOString().split('T')[0]; // Lấy ngày dưới dạng chuỗi 'yyyy-MM-dd'
// };

export  const calculateTimeAgo = (createdDate) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(createdDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return "1 ngày trước";
    } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    } else {
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks === 1) {
            return "1 tuần trước";
        } else {
            return `${diffWeeks} tuần trước`;
        }
    }
};