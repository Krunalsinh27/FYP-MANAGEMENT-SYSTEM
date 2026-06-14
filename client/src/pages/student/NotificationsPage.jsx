import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getNotifications, deleteNotification, markAllAsRead, markAsRead } from "../../store/slices/notificationSlice.js";
import { MessageCircle, Clock5, BadgeCheck, Calendar, Settings, User, ChevronDown, AlertCircle, CheckCircle2, Clock, Bell, BellOff} from "lucide-react";

const NotificationsPage = () => {

  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notification.list);
  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = (id) => dispatch(markAsRead(id));
  const markAllAsReadHandler = () => dispatch(markAllAsRead());
  const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;

      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />

      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />

      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />

      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />

      default:
        // Custom combined icon (User + Down Arrow)
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getTypeBadgeClasses = (type) => {
    switch (type) {
      case "feedback":
        return "badge-approved";
      case "deadline":
        return "badge-rejected";
      case "approval":
        return "badge-completed";
      case "meeting":
        return "badge-pending";
      default:
        return "badge badge-pending text-slate-700 bg-slate-100";
    }
  };

  const formateDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if(diffMinutes < 1) return "Just now";
    if(diffMinutes < 60) return `${diffMinutes} min ago`;
    if(diffHours < 24) return `${diffHours} hrs ago`;
    if(diffDays === 1) return "Yesterday";
    if(diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return <>

    <div className="space-y-6">
      <div className="card">

        {/* CARD HEADER */}
        <div className="card-header">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="card-title">Notifications</h1>
              <p className="card-subtitle">
                Stay updated with your project progress and deadlines
              </p>
            </div>
            {notifications.length > 0 && (
              <button className="btn-outline btn-small" onClick={markAllAsReadHandler}>
                Mark all as read{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            )}
          </div>
        </div>

        {/* NOTIFICATIONS STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {
            stats.map((item, i) => {
              return (
                <div key={i} className={`${item.bg} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <div className={`p-2 ${item.iconBg} rounded-lg`}>
                      <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>

                    <div className="ml-3">
                      <p className={`text-sm font-medium ${item.titleColor}`}>{item.title}</p>
                      <p className={`text-sm font-medium ${item.valueColor}`}>{item.value}</p>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {
            notifications.map((notification) => {
              return (
                <div key={notification._id} className={`relative flex gap-4 rounded-2xl border p-4 transition-all ${!notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                  <div className="flex items-start gap-4 w-full">
                    <div className="flex-shrink-0 mt-1 p-3 rounded-full bg-slate-100 text-slate-700">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h3 className={`text-base font-semibold ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                            )}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500">
                          {formateDate(notification.createdAt)}
                        </p>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className={`badge px-3 py-1 text-xs font-semibold capitalize ${getTypeBadgeClasses(notification.type)}`}>
                          {notification.type}
                        </span>
                        <div className="flex items-center gap-3">
                          {!notification.isRead && (
                            <button className="text-sm text-blue-600 hover:text-blue-500 transition-colors" onClick={() => markAsReadHandler(notification._id)}>
                              Mark as read
                            </button>
                          )}
                          <button className="text-sm text-red-600 hover:text-red-500 transition-colors" onClick={() => deleteNotificationHandler(notification._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {
          notifications.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-3 text-slate-600">
                
                <BellOff w-12 h-12/>
                <p className="text-slate-500">No notifications yet</p>
              </div>

            </div>
          )}
      </div>
    </div>

  </>;
};

export default NotificationsPage;
