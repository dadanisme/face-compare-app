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

export default function Home() {
  const students = useStudents();
  const parents = useParents();

  const [filteredStudents, setFilteredStudents] = useState(students);

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
        <div className="flex flex-row space-x-2">
          <Link href={`/${row.parentId}?student=${row.id}`}>
            <Button size="sm">Open</Button>
          </Link>

          <a
            href={`https://wa.me/${
              parents.find((p) => p.id === row.parentId)?.phone ?? ""
            }`}
            target="_blank"
          >
            <Button color="accent" size="sm">
              Chat
            </Button>
          </a>
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
