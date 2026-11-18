import ApiInterceptor from '../services/interceptor.service';

// Use the single axios instance from the interceptor service
const axiosInstance = ApiInterceptor.init();

export default axiosInstance;
