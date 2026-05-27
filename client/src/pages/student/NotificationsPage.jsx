import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, deleteNotification, markAllAsRead } from "../../store/slices/notificationSlice";
import { MessageCircle, Clock5, BadgeCheck, Calender, Settings, User, ChevronDown} from "lucide-react";

const NotificationsPage = () => {

  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
ndler
  useEffect(() => (
    dispatch(getNotifications());
  ), [dispatch]);

  const markAsReadHa = (id) => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = () => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />
      
      case "meeting":
        return <Calender className="w-6 h-6 text-purple-500" />
      
      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />

      default:
        // Custom combined icon (User + Down Arrow)
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute"/>
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": 
        return "border-1-red-500"
        break;
      case "medium":
        return "border-1-yellow-500"
        break;
      case "low":
        return "border-1-green-500"
        break;

      default:
        return "border-1-slate-300";
        break;
    }
  };

  const formateDate = (dateStr)=>{
    const date = new Date(dateStr);
    const now = Date();
    const diffTime = Math.abs(n - date);
  }

  return <></>;
};

export default NotificationsPage;
