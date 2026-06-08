import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptRequest, getTeacherRequests, rejectRequest } from "../../store/slices/teacherSlice";

const PendingRequests = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser._id))
  }, [dispatch, authUser._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);

    try {
      await dispatch(acceptRequest(id)).unwrap();
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);

    try {
      await dispatch(rejectRequest(id)).unwrap();
    } finally {
      setLoading(id, "rejecting", false);
    }
  };


  const requests = Array.isArray(list)
    ? list
    : Array.isArray(list?.requests)
    ? list.requests
    : [];

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request?.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request?.project?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  return (
    <>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Pending Supervision Requests</h1>
            <p className="card-subtitle">Review and respond to student supervision requests</p>
          </div>

          {/* SEARCH & FILTER */}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input type="text" placeholder="Search by student name or project title..." className="input-field flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

            <select className="input-field sm:w-48" value={filterStatus} onChange={(e) => {
              setFilterStatus(e.target.value)
            }}>
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* REQUESTS */}
        <div className="space-y">
          {
            filteredRequests.map((req, index) => {
              const id = req._id || req.id || `request-${index}`;
              const project = req.latestProject;
              const projectStatus = project?.status?.toLowerCase() || "pending";
              const supervisorAssigned = !!project?.supervisor;
              const canAccept = projectStatus === "approved" && !supervisorAssigned;
              const lm = loadingMap[id] || {};

              let bgClass = "bg-white";
              let StatusMessage = "";

              if(projectStatus === "approved" && supervisorAssigned){
                bgClass = "bg-blue-50 border-blue-300";
                StatusMessage = "Supervisor already assigned";
              }else if(projectStatus === "rejected"){
                bgClass = "bg-red-50 border-red-300";
                StatusMessage = "Project proposal rejected";
              }else if(projectStatus === "pending"){
                bgClass = "bg-yellow-50 border-yellow-300";
                StatusMessage = "Project proposal pending";
              }
              return <div key={id} className={`card border ${bgClass} transition-all`}>
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{req?.student?.name || "Unknow Student"}</h3>
                      <span className={`badge ${req.status === "pending" ? "badge-pending" : req.status === "accepted" ? "badge-approved" : "badge-rejected"}`}>{req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}</span>
                    </div>

                    <p className="text-sm text-slate-600 mb-1">{req.student?.email || "No email"}</p>
                    <h4 className="font-medium text-slate-700 mb-2">{project?.title || "No project title"}</h4>
                    <p className="text-xs text-slate-500">Submitted:{" "}{req?.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</p>

                    {
                      StatusMessage && (
                        <p className="mt-2 text-sm font-medium text-slate-700">{StatusMessage}</p>
                      )
                    }
                  </div>
                </div>
              </div>
            })}
        </div>
      </div>

    </>
  );
};

export default PendingRequests;
