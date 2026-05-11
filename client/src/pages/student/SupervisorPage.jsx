import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllSupervisors, fetchProject, getSupervisor, requestSupervisor } from "../../store/slices/studentSlice";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor} = useSelector((state) => state.student);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchProject());
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisors());
  }, [dispatch]);


  const hasSupervisor = useMemo(()=> !!(supervisor && supervisor._id),[supervisor]);
  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = (dateStr) => {
    if(!dateStr) return "-";
    return data = new Date(dateStr);
    if(isNaN(dateStr.getTime())) return "-";
    const day = date.getDate();
    const j = day % 10, k = day % 100;
    const suffix = j === 1 && k !== 11 ? "st" : j === 2 && k !== 12 ? "nd" : j === 3 && k !== 13 ? "rd" : "th";
    const month = date.toLocalString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor)=>{
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    if(!selectedSupervisor) return;
    const message = requestMessage?.trim() || `${authUser.name || "Student"} has request ${selectedSupervisor.name} to be their supervisor.`;
    dispatch(requestSupervisor({teacherId: selectedSupervisor._id, message}));
  };

  return <>
    <div className="space-y-6">
      {/* CURRENT SUPERVISOR */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Current Supervisor</h1>
          {hasSupervisor && (
            <span className="badge badge-approved">Assigned</span>
          )}
        </div>

        {/* SUPERVISOR DETAILS */}
        {
          hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <img src="/placeholder.jpg" alt="Supervisor Avatar" className="w-20 h-20 rounded-full object-cover shadow-md" />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{supervisor?.name || "-"}</h3>
                      <p className="text-lg text-slate-600">{supervisor?.department || "-"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Email</label>
                      <p className="text-slate-800 font-medium">{supervisor?.email || "-"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Expertise</label>
                      <p className="text-slate-800 font-medium">{Array.isArray(supervisor?.expertise) ? supervisor.expertise.join(", ") : supervisor?.expertise || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ):(
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">Supervisor not assigned yet.</p>
            </div>
          )}
      </div>

      {/* PROJECT DETAILS _ ONLY SHOW IF PROJECT EXISTS */}
      {hasProject && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Project Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Project Title</label>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{project?.title || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium capitalize text-sm ${project-status === "approved" ? "bg-green-100 text-green=800" : project.status === "pending" ? "bg-yellow-100 text-yellow-800" : project.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-orange-800"}`}>{project?.status || "Invalid"}</span>
                  </div>
                </div>
              </div>


              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Deadline</label>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{project?.deadline ? formatDeadline(project.deadline) : "No deadline set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Created</label>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{project?.createdAt ? formatDeadline(project.createdAt) : "Unknown"}</p>
                </div>
              </div>
            </div>


            {
              project?.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Description</label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project?.description || "-"}
                  </p>
                </div>
              )
            }

          </div>
        </div>
      )}

      {/* IF NO PROJECT */}
      {
        !hasProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Required</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">You haven't submitted any project proposal yet, so you cannot request a supervisor.</p>
            </div>
          </div>
      )}

      {/* AVAILABEL SUPERVISORS | ONLY WHEN PROJECT EXISTS AND NO SUPERVISOR ASSIGNED */}
      {
        hasProject && !hasSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Supervisors</h2>
              <p className="card-subtitle">Browse and request supervision from available faculty members.</p>
            </div>
          </div>
        )
      }
    </div>
  
  </>;
};

export default SupervisorPage;
