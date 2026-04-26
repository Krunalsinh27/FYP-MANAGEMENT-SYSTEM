import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import {getAllUsers} from "../../store/slices/adminSlice";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector(state.popup);
  const [showModal, setShowModal] = useState(false);
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

  const dispatch = useDispatch();

  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
        (u) => u.role?.toLowerCase() === "student"
      );

      return studentUsers.map(student => {
        const studentProject = (projects || []).find(
          p=> p.student?._id === student._id
        );
        return {
          ...student,
          projectTitle: studentProject?.title || null,
          supervisor: studentProject?.supervisor || null,
          projectStatus: studentProject?.status || null,
        };
      });

    }, [users, projects]);

    useEffect(() => {
      dispatch(getAllUsers());
    });

    const departments = useMemo(() => {

    }, [students]);

  return <></>;
};

export default ManageStudents;
