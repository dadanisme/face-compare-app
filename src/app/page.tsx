"use client";
import React, { useEffect, useState } from "react";
import { useParents, useStudents } from "@/services";
import Link from "next/link";
import { Button, Input } from "react-daisyui";
import DataTable, { TableColumn } from "react-data-table-component";
import { Parent, Student } from "@/types/models";
import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase";
import { faker } from "@faker-js/faker";
import { Modal } from "react-daisyui";

export default function Home() {
  const students = useStudents();
  const parents = useParents();

  const [filteredStudents, setFilteredStudents] = useState(students);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student>();

  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  const columns: TableColumn<Student>[] = [
    {
      name: "#",
      cell: (_, index) => index + 1,
      width: "50px",
    },
    {
      name: "Nama Siswa",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Nama Orang Tua",
      selector: (row) =>
        parents.find((p) => p.id === row.parentId)?.name ?? row.parentId,
      sortable: true,
    },
    {
      name: "Nomor Telepon Orang Tua",
      selector: (row) =>
        parents.find((p) => p.id === row.parentId)?.phone ?? row.parentId,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-row space-x-2 whitespace-nowrap">
          <Link href={`/${row.parentId}?student=${row.id}`}>
            <Button className="normal-case" size="sm">
              Deteksi Penjemput
            </Button>
          </Link>

          <a
            href={`https://wa.me/${
              parents.find((p) => p.id === row.parentId)?.phone ?? ""
            }`}
            target="_blank"
          >
            <Button className="normal-case" color="accent" size="sm">
              Chat
            </Button>
          </a>

          <Button
            className="normal-case"
            color="neutral"
            size="sm"
            onClick={() => {
              setSelectedStudent(row);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    // (async () => {
    //   const res = await fetch("/api/dataset");
    //   const data = (await res.json()) as Parent[];
    //   const ref = collection(db, "parents");
    //   Promise.all(data.map((parent) => addDoc(ref, parent))).then(() =>
    //     console.log("done")
    //   );
    // })();
    // if (parents.length === 0) return;
    // const ref = collection(db, "students");
    // const fakeStudents = Array.from({ length: 30 }, () => ({
    //   name: faker.person.fullName(),
    //   class: faker.person.jobTitle(),
    //   parentId: parents[Math.floor(Math.random() * parents.length)].id,
    // }));
    // Promise.all(fakeStudents.map((student) => addDoc(ref, student))).then(() =>
    //   console.log("done")
    // );
  }, []);

  return (
    <div className="p-28">
      <Modal.Legacy
        open={modalOpen}
        onClickBackdrop={() => setModalOpen(false)}
      >
        <Modal.Body>
          {selectedStudent && (
            <ModalContent
              student={selectedStudent}
              parent={parents.find((p) => p.id === selectedStudent.parentId)}
              setModalOpen={setModalOpen}
            />
          )}
        </Modal.Body>
      </Modal.Legacy>
      <h1 className="text-3xl font-bold">Data Penjemput Siswa</h1>
      <div>
        <DataTable
          columns={columns}
          data={filteredStudents}
          pagination
          actions={
            <Input
              placeholder="Search"
              onChange={(e) => {
                const filtered = students.filter(
                  (student) =>
                    student.name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()) ||
                    parents
                      .find((p) => p.id === student.parentId)
                      ?.name.toLowerCase()
                      .includes(e.target.value.toLowerCase())
                );
                setFilteredStudents(filtered);
              }}
              className="my-2 float-right"
            />
          }
        />
      </div>
    </div>
  );
}

const ModalContent = ({
  student,
  parent,
  setModalOpen,
}: {
  student: Student;
  parent?: Parent;
  setModalOpen: (open: boolean) => void;
}) => {
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(parent?.phone ?? "");
  const [parentName, setParentName] = useState(parent?.name ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(student.name);
    setPhone(parent?.phone ?? "");
    setParentName(parent?.name ?? "");
  }, [student, parent]);

  const handleSave = async () => {
    setLoading(true);
    const batch = writeBatch(db);
    const studentRef = doc(db, "students", student.id);
    const parentRef = doc(db, "parents", student.parentId);
    batch.update(studentRef, { name });
    batch.update(parentRef, { name: parentName, phone });
    await batch.commit();
    setLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm">Nama Siswa</label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      <label className="text-sm">Nama Orang Tua</label>
      <Input
        value={parentName}
        onChange={(e) => setParentName(e.target.value)}
      />

      <label className="text-sm">Nomor Telepon Orang Tua</label>
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

      <Button onClick={handleSave} loading={loading}>
        Simpan
      </Button>
    </div>
  );
};
