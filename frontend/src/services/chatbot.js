export const sendMessage = async (message, history) => {
  // TODO: Replace with real API call
  // const apiUrl = import.meta.env.CHATBOT_API_URL || 'http://localhost:8080/api/chat';
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock logic
      const msg = message.toLowerCase();
      if (msg.includes('lỗi') || msg.includes('fail')) {
        reject(new Error('Network error'));
      } else if (msg.includes('cv')) {
        resolve('Để tạo CV, bạn hãy vào mục "Hồ sơ & CV" trên thanh điều hướng, chọn "Tạo CV" và làm theo các bước nhé!');
      } else if (msg.includes('lương')) {
        resolve('Bạn có thể gõ từ khóa "Lương cao" vào thanh tìm kiếm để lọc các công việc có mức lương hấp dẫn.');
      } else {
        resolve(`Mình đã nhận được yêu cầu: "${message}". Hiện tại tính năng này đang được thử nghiệm, mình sẽ cố gắng hoàn thiện sớm nhất!`);
      }
    }, 800);
  });
};
