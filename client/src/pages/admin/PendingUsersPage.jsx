import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader, Check, X, Ban, RotateCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PendingUsersPage = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingUsers();
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "students" 
        ? `${API_URL}/api/v1/admin/pending-students`
        : `${API_URL}/api/v1/admin/pending-teachers`;

      const { data } = await axios.get(endpoint, {
        withCredentials: true,
      });

      if (activeTab === "students") {
        setPendingStudents(data.data.students || []);
      } else {
        setPendingTeachers(data.data.teachers || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm("Are you sure you want to approve this user?")) return;

    setActionLoading(userId);
    try {
      const { data } = await axios.put(
        `${API_URL}/api/v1/admin/approve-user/${userId}`,
        {},
        { withCredentials: true }
      );

      toast.success(data.message);
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (user) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(selectedUser._id);
    try {
      const { data } = await axios.put(
        `${API_URL}/api/v1/admin/reject-user/${selectedUser._id}`,
        { reason: rejectionReason },
        { withCredentials: true }
      );

      toast.success(data.message);
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = activeTab === "students" ? pendingStudents : pendingTeachers;

  return (
    <div className="p-6" data-testid="pending-users-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="page-title">
          Pending User Approvals
        </h1>
        <p className="text-slate-600">
          Review and approve or reject user registrations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          data-testid="students-tab"
          onClick={() => setActiveTab("students")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "students"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Pending Students ({pendingStudents.length})
        </button>
        <button
          data-testid="teachers-tab"
          onClick={() => setActiveTab("teachers")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "teachers"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Pending Teachers ({pendingTeachers.length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12" data-testid="loading-spinner">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && pendingUsers.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No Pending {activeTab === "students" ? "Students" : "Teachers"}
          </h3>
          <p className="text-slate-600">
            All {activeTab === "students" ? "student" : "teacher"} registrations have been processed.
          </p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && pendingUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="pending-users-grid">
          {pendingUsers.map((user) => (
            <div
              key={user._id}
              data-testid={`user-card-${user._id}`}
              className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800" data-testid={`user-name-${user._id}`}>
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-500" data-testid={`user-email-${user._id}`}>
                    {user.email}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  Pending
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {activeTab === "students" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Enrollment:</span>
                      <span className="font-medium text-slate-800">{user.enrollmentNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Semester:</span>
                      <span className="font-medium text-slate-800">{user.semester}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employee ID:</span>
                      <span className="font-medium text-slate-800">{user.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Designation:</span>
                      <span className="font-medium text-slate-800">{user.designation}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Department:</span>
                  <span className="font-medium text-slate-800">{user.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mobile:</span>
                  <span className="font-medium text-slate-800">{user.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email Verified:</span>
                  <span className={`font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  data-testid={`approve-btn-${user._id}`}
                  onClick={() => handleApprove(user._id)}
                  disabled={actionLoading === user._id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === user._id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
                <button
                  data-testid={`reject-btn-${user._id}`}
                  onClick={() => handleRejectClick(user)}
                  disabled={actionLoading === user._id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="reject-modal">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Reject User Registration
            </h3>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting <strong>{selectedUser?.name}</strong>'s registration:
            </p>
            <textarea
              data-testid="rejection-reason-input"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-2">
              <button
                data-testid="cancel-reject-btn"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-reject-btn"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUsersPage;