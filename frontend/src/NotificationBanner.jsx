import { useNotification } from "./components/NotificationContext";

const NotificationBanner = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg animate-pulse">
      {notification}
    </div>
  );
};

export default NotificationBanner;
