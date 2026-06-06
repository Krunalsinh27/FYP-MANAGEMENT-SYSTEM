import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
import { CheckCircle, Clock, User, Users } from "lucide-react";

const TeacherDashboard = () => {

  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector(state.auth);

  useEffect(() => {
    dispatch(getTeacherDashboardStats())
  }, [dispatch]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: authUser?.assignedStudents?.length || 0,
      loading,
      icon: Users,
      bg: "bg-slate-600",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      icon: Clock,
      bg: "bg-yellow-600",
      color: "text-yellow-600",
    },
    {
      title: "Complete Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      icon: CheckCircle,
      bg: "bg-green-600",
      color: "text-green-600",
    },
  ];

  return (
    <>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-green-100">Manage your students and provide guidance on their projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">📘</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Project Title</p>
                <p className="text-lg font-semibold text-slate-800">{project?.title || "No Project"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-subtitle">Latest notifications and updates.</p>
        </div>

        <div className="space-y-4">

        </div>
      </div>

    </>
  );
};

export default TeacherDashboard;
