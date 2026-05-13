import { /*{useEffect},*/ useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {
  // createStudent,
  deleteStudent,
  // getAllUsers,
  updateStudent,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Plus, TriangleAlert, Users, X } from "lucide-react";
import { toggleStudentModal } from "../../store/slices/popupSlice";

const ManageStudents = () => {
  const dispatch = useDispatch();

  const { users = [], projects = [] } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);

  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  // useEffect(() => {
  //   dispatch(getAllUsers());
  // }, [dispatch]);

  const students = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers
      .filter((u) => u.role?.toLowerCase() === "student")
      .map((student) => {
        const studentProject = projects.find(
          (p) => p.student === student._id
        );

        return {
          ...student,
          projectTitle: studentProject?.title || null,
          supervisor: studentProject?.supervisor || null,
          projectStatus: studentProject?.status || null,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await dispatch(updateStudent({ id: editingStudent._id, data: formData })).unwrap();
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save student:", err);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await dispatch(deleteStudent(studentToDelete._id)).unwrap();
        setShowDeleteModal(false);
        setStudentToDelete(null);
      } catch (err) {
        console.error("Failed to delete student:", err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  }

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

          {
            filteredStudents && filteredStudents.length > 0 ? (
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
                    filteredStudents.map(student => {
                      return (
                        <tr key={student._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{student.name}</div>
                              <div className="text-sm font-medium text-slate-500">{student.email}</div>
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
                            {
                              student.supervisor ? (
                                <span className=
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-green-800 bg-gray-100 text-xs font-medium">
                                  {users?.find((u) => u._id === student?.supervisor)?.name}
                                </span>
                              ) : (
                                <span className=
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                                  {student.projectStatus === "rejected"
                                    ? "Rejected"
                                    : "Not Assigned"}
                                </span>
                              )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{student.projectTitle}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-900">Edit</button>
                              <button onClick={() => handleDelete(student)} className="text-red-600 hover:text-red-900">Delete</button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-500">No students found matching your criteria.</div>
              ))
          }

        </div>

        {/* EDIT STUDENT MODAL */}
        {
          showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Student
                  </h3>
                  <button onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ">
                      Full Name
                    </label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ">
                      Email
                    </label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ">
                      Department
                    </label>

                    <select className="input-field w-full py-1 border-b border-slate-600 focus:outline-none" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Economics">Economics</option>
                      <option value="Psychology">Psychology</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={handleCloseModal} className="btn-danger">Cancel</button>
                    <button type="submit" className="btn-primary">Update Student</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {
          showDeleteModal && studentToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Delete Studnet</h3>
                  <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete <span>{studentToDelete.name}? This action cannot be undone.</span></p>
                  <div className="flex justify-center space-x-3">
                    <button onClick={cancelDelete} className="btn-secondary">Cancel</button>
                    <button onClick={confirmDelete} className="btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCreateStudentModalOpen && <AddStudent/>}
      </div>
    </div>
  );
};

export default ManageStudents;