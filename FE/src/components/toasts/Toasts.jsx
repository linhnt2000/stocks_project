import { toast } from "react-toastify";

const defaultOptions = {
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const toasts = {
  successTopCenter: (message) => {
    toast.success(message, {
      ...defaultOptions,
      toastId: "success-center",
      position: "top-center",
    });
  },
  successTopRight: (message) => {
    toast.success(message, {
      ...defaultOptions,
      toastId: "success-right",
      position: "top-right",
    });
  },
  errorTopCenter: (message) => {
    toast.error(message, {
      ...defaultOptions,
      toastId: "error-center",
      position: "top-center",
    });
  },
  errorTopRight: (message) => {
    toast.error(message, {
      ...defaultOptions,
      toastId: "error-right",
      position: "top-right",
    });
  },
};

export default toasts;
