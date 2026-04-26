import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  createStudent,
  deleteStudent,
  getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import { CheckCircle, Plus, TriangleAlert, Users } from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";

const ManageStudents = () => {
  const dispatch = useDispatch();

  const { users = [], projects = [] } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);

  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const students = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers
      .filter((u) => u.role?.toLowerCase() === "student")
      .map((student) => {
        const studentProject = projects.find(
          (p) => p.student?._id === student._id
        );

        return {
          ...student,
          projectTitle: studentProject?.title || null,
          supervisor: studentProject?.supervisor || null,
          status: studentProject?.status || null,
        };
      });
  }, [users, projects]);

  const departments = useMemo(() => {
    return [
      ...new Set(students.map((s) => s.department).filter(Boolean)),
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterDepartment === "all" ||
        student.department === filterDepartment;

      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterDepartment]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, data: formData }));
    } else {
      dispatch(createStudent(formData));
    }
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h1 className="card-title">Manage Students</h1>
            <p className="card-subtitle">
              Add, edit, and manage student accounts
            </p>
          </div>

          <button
            onClick={() => dispatch(toggleStudentModal())}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL */}
        <div className="card">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600" />
            <div className="ml-4">
              <p>Total Students</p>
              <p>{students.length}</p>
            </div>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <div className="ml-4">
              <p>Completed Projects</p>
              <p>
                {students.filter((s) => s.status === "completed").length}
              </p>
            </div>
          </div>
        </div>

        {/* UNASSIGNED */}
        <div className="card">
          <div className="flex items-center">
            <TriangleAlert className="w-6 h-6 text-yellow-600" />
            <div className="ml-4">
              <p>Unassigned</p>
              <p>{students.filter((s) => !s.supervisor).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Students</label>
            <input type="text" placeholder="Search by name or email..." className="input-field w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter Status</label>
            <select className="input-field w-full" value={filterDepartment} onChange={(e) => {
              setFilterDepartment(e.target.value)
            }}>
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option value={dept} key={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Students List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Student Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Department & Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Supervisor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Project Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-200">
              {
                filteredStudents.map(student=>{
                  return(
                    <tr key={student._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{student.name}</div>
                          <div className="text-sm font-medium text-slate-500">{student.email}</div>
                          {
                            student.studentId && (
                              <div className="text-xs text-slate-400">ID: {student.studentId}</div>
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {student.department || "-"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.createdAt ? new Date(student.createdAt).getFullYear() : "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {student.supervisor?.name || "-"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.supervisor?.email || "No supervisor assigned"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;