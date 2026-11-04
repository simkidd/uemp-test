"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminFaculties,
  useAdminDepartments,
  useAdminProgrammes,
  useCreateFaculty,
  useUpdateFaculty,
  useCreateDepartment,
  useUpdateDepartment,
  useCreateProgramme,
  useUpdateProgramme,
} from "@/hooks/queries";
import { IFaculty, IDepartment, IProgramme } from "@/interfaces";
import { toast } from "sonner";
import {
  Building2,
  GraduationCap,
  Plus,
  Loader2,
  BookOpen,
  Search,
  Pencil,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AdminStructureView() {
  const { data: faculties = [], isLoading: loadingFaculties } =
    useAdminFaculties();
  const { data: departments = [], isLoading: loadingDepts } =
    useAdminDepartments();
  const { data: programmes = [], isLoading: loadingProgrammes } =
    useAdminProgrammes();

  // Mutations
  const createFacultyMutation = useCreateFaculty();
  const updateFacultyMutation = useUpdateFaculty();
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const createProgMutation = useCreateProgramme();
  const updateProgMutation = useUpdateProgramme();

  // Selected Faculty for Split-Pane Explorer
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(
    null,
  );

  // Search queries
  const [facultySearch, setFacultySearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  // Create Modals state
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [facName, setFacName] = useState("");
  const [facCode, setFacCode] = useState("");
  const [facDesc, setFacDesc] = useState("");

  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptFacultyId, setDeptFacultyId] = useState("");

  const [isProgOpen, setIsProgOpen] = useState(false);
  const [progName, setProgName] = useState("");
  const [progCode, setProgCode] = useState("");
  const [progDeptId, setProgDeptId] = useState("");
  const [progDuration, setProgDuration] = useState(4);
  const [progDegreeType, setProgDegreeType] = useState("B.Sc.");

  // Edit Modals state
  const [editingFaculty, setEditingFaculty] = useState<IFaculty | null>(null);
  const [editFacName, setEditFacName] = useState("");
  const [editFacCode, setEditFacCode] = useState("");
  const [editFacDesc, setEditFacDesc] = useState("");

  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptCode, setEditDeptCode] = useState("");
  const [editDeptFacultyId, setEditDeptFacultyId] = useState("");

  const [editingProg, setEditingProg] = useState<IProgramme | null>(null);
  const [editProgName, setEditProgName] = useState("");
  const [editProgCode, setEditProgCode] = useState("");
  const [editProgDuration, setEditProgDuration] = useState(4);
  const [editProgDegreeType, setEditProgDegreeType] = useState("B.Sc.");

  // Filter faculties by search
  const filteredFaculties = useMemo(() => {
    return faculties.filter((f: IFaculty) => {
      const q = facultySearch.toLowerCase().trim();
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
      );
    });
  }, [faculties, facultySearch]);

  // Active faculty selection: fallback to first faculty if none selected
  const activeFaculty = useMemo(() => {
    if (selectedFacultyId) {
      const found = faculties.find(
        (f: IFaculty) => f._id === selectedFacultyId,
      );
      if (found) return found;
    }
    return filteredFaculties[0] || faculties[0] || null;
  }, [faculties, filteredFaculties, selectedFacultyId]);

  // Map departments to their parent faculty ID
  const departmentsByFaculty = useMemo(() => {
    const map = new Map<string, IDepartment[]>();
    departments.forEach((dept: IDepartment) => {
      const fId =
        typeof dept.faculty === "object" && dept.faculty !== null
          ? dept.faculty._id
          : String(dept.faculty);
      if (!map.has(fId)) map.set(fId, []);
      map.get(fId)!.push(dept);
    });
    return map;
  }, [departments]);

  // Map programmes to their parent department ID
  const programmesByDept = useMemo(() => {
    const map = new Map<string, IProgramme[]>();
    programmes.forEach((prog: IProgramme) => {
      const dId =
        typeof prog.department === "object" && prog.department !== null
          ? prog.department._id
          : String(prog.department);
      if (!map.has(dId)) map.set(dId, []);
      map.get(dId)!.push(prog);
    });
    return map;
  }, [programmes]);

  // Departments for currently selected faculty
  const currentFacultyDepartments = useMemo(() => {
    if (!activeFaculty) return [];
    const depts = departmentsByFaculty.get(activeFaculty._id) || [];
    const q = deptSearch.toLowerCase().trim();
    if (!q) return depts;
    return depts.filter(
      (d: IDepartment) =>
        d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
    );
  }, [activeFaculty, departmentsByFaculty, deptSearch]);

  // Total programmes under active faculty
  const activeFacultyProgrammeCount = useMemo(() => {
    if (!activeFaculty) return 0;
    const depts = departmentsByFaculty.get(activeFaculty._id) || [];
    return depts.reduce(
      (sum, d) => sum + (programmesByDept.get(d._id)?.length || 0),
      0,
    );
  }, [activeFaculty, departmentsByFaculty, programmesByDept]);

  // ================= ACTION HANDLERS =================
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createFacultyMutation.mutateAsync({
        name: facName.trim(),
        code: facCode.trim().toUpperCase(),
        description: facDesc.trim() || undefined,
      });
      toast.success("Faculty Created", {
        description: `${created.name} is now registered in the hierarchy.`,
      });
      setIsFacultyOpen(false);
      setFacName("");
      setFacCode("");
      setFacDesc("");
      setSelectedFacultyId(created._id);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create faculty";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    try {
      await updateFacultyMutation.mutateAsync({
        id: editingFaculty._id,
        data: {
          name: editFacName.trim(),
          code: editFacCode.trim().toUpperCase(),
          description: editFacDesc.trim(),
        },
      });
      toast.success("Faculty Updated", {
        description: "Faculty details updated successfully.",
      });
      setEditingFaculty(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update faculty";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const openAddDeptForFaculty = (facultyId: string) => {
    setDeptFacultyId(facultyId);
    setDeptName("");
    setDeptCode("");
    setIsDeptOpen(true);
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetFacId = deptFacultyId || activeFaculty?._id;
      if (!targetFacId) {
        toast.error("Please select a parent faculty.");
        return;
      }
      const created = await createDeptMutation.mutateAsync({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        faculty: targetFacId,
      });
      toast.success("Department Created", {
        description: `${created.name} created successfully.`,
      });
      setIsDeptOpen(false);
      setDeptName("");
      setDeptCode("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create department";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      await updateDeptMutation.mutateAsync({
        id: editingDept._id,
        data: {
          name: editDeptName.trim(),
          code: editDeptCode.trim().toUpperCase(),
          facultyId: editDeptFacultyId,
        },
      });
      toast.success("Department Updated", {
        description: "Department details updated successfully.",
      });
      setEditingDept(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update department";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const openAddProgForDept = (deptId: string) => {
    setProgDeptId(deptId);
    setProgName("");
    setProgCode("");
    setProgDuration(4);
    setProgDegreeType("B.Sc.");
    setIsProgOpen(true);
  };

  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!progDeptId) {
        toast.error("Please select a department.");
        return;
      }
      const created = await createProgMutation.mutateAsync({
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        department: progDeptId,
        durationYears: Number(progDuration),
        degreeType: progDegreeType,
      });
      toast.success("Programme Created", {
        description: `${created.name} degree programme registered.`,
      });
      setIsProgOpen(false);
      setProgName("");
      setProgCode("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create programme";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const handleUpdateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProg) return;
    try {
      await updateProgMutation.mutateAsync({
        id: editingProg._id,
        data: {
          name: editProgName.trim(),
          code: editProgCode.trim().toUpperCase(),
          durationYears: Number(editProgDuration),
          degreeAwarded: editProgDegreeType,
        },
      });
      toast.success("Programme Updated", {
        description: "Degree programme updated successfully.",
      });
      setEditingProg(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update programme";
      toast.error("Action Failed", { description: errorMsg });
    }
  };

  const isLoading = loadingFaculties || loadingDepts || loadingProgrammes;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-burgundy-700" />
        <span className="text-xs font-medium">
          Loading university academic structure...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Academic Hierarchy Explorer
            </h1>
            <Badge className="bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/60 dark:text-burgundy-300 border-burgundy-200 dark:border-burgundy-900">
              Institutional Structure
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Hierarchical management: Faculties &rarr; Departments &rarr;
            Accredited Degree Programmes.
          </p>
        </div>

        {/* Global Action & KPI Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span>{faculties.length} Faculties</span> &bull;
            <span>{departments.length} Depts</span> &bull;
            <span>{programmes.length} Programmes</span>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setFacName("");
              setFacCode("");
              setFacDesc("");
              setIsFacultyOpen(true);
            }}
            className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Faculty
          </Button>
        </div>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT PANE: FACULTIES ROSTER ================= */}
        <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col py-0 gap-0">
          <CardHeader className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-burgundy-700 dark:text-burgundy-400" />
                <CardTitle className="text-sm font-bold">
                  Faculties Directory
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {filteredFaculties.length} of {faculties.length}
              </Badge>
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search faculty name or code..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-zinc-50/50 dark:bg-zinc-950/40"
              />
            </div>
          </CardHeader>

          <CardContent className="p-2 space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredFaculties.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                <p>No faculties match your search.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFacultyOpen(true)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add New Faculty
                </Button>
              </div>
            ) : (
              filteredFaculties.map((fac: IFaculty) => {
                const isSelected = activeFaculty?._id === fac._id;
                const deptCount =
                  departmentsByFaculty.get(fac._id)?.length || 0;

                return (
                  <div
                    key={fac._id}
                    onClick={() => {
                      setSelectedFacultyId(fac._id);
                      setDeptSearch("");
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-burgundy-50/70 dark:bg-burgundy-950/40 border-burgundy-300 dark:border-burgundy-800 shadow-xs ring-1 ring-burgundy-200 dark:ring-burgundy-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-burgundy-700 text-white shadow-2xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        {fac.code}
                      </div>

                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate block">
                          {fac.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {deptCount}{" "}
                          {deptCount === 1 ? "Department" : "Departments"}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? "text-burgundy-700 dark:text-burgundy-400 translate-x-0.5"
                          : "text-zinc-300"
                      }`}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* ================= RIGHT PANE: SELECTED FACULTY WORKSPACE ================= */}
        <div className="lg:col-span-8 space-y-6">
          {activeFaculty ? (
            <>
              {/* Active Faculty Hero Card */}
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden py-0 gap-0">
                <div className="p-5 sm:p-6 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-950 text-white relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                        {activeFaculty.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                            {activeFaculty.name}
                          </h2>
                          <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px]">
                            Accredited Faculty
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-200/90 mt-1 max-w-xl">
                          {activeFaculty.description ||
                            "Official university degree-awarding collegiate division."}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingFaculty(activeFaculty);
                          setEditFacName(activeFaculty.name);
                          setEditFacCode(activeFaculty.code);
                          setEditFacDesc(activeFaculty.description || "");
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Faculty
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAddDeptForFaculty(activeFaculty._id)}
                        className="bg-white hover:bg-zinc-100 text-burgundy-900 font-semibold text-xs shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Department
                      </Button>
                    </div>
                  </div>

                  {/* Micro stats strip */}
                  <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-6 text-xs text-zinc-200">
                    <div>
                      <span className="text-[11px] text-zinc-300 block">
                        Departments
                      </span>
                      <strong className="text-base text-white">
                        {currentFacultyDepartments.length}
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <div>
                      <span className="text-[11px] text-zinc-300 block">
                        Accredited Programmes
                      </span>
                      <strong className="text-base text-white">
                        {activeFacultyProgrammeCount}
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <div>
                      <span className="text-[11px] text-zinc-300 block">
                        Faculty Code
                      </span>
                      <strong className="text-base font-mono text-white">
                        {activeFaculty.code}
                      </strong>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Departments Sub-section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-burgundy-700 dark:text-burgundy-400" />
                      Departments in {activeFaculty.name} (
                      {currentFacultyDepartments.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Operational academic units and their underlying
                      degree-awarding programmes.
                    </p>
                  </div>

                  {/* Department filter */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      placeholder="Search departments..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {/* Departments Grid */}
                {currentFacultyDepartments.length === 0 ? (
                  <Card className="border-dashed border-zinc-300 dark:border-zinc-800 text-center py-12">
                    <CardContent className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                        <FolderTree className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          No departments found
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                          {deptSearch
                            ? "No departments match your search query."
                            : `There are currently no departments under ${activeFaculty.name}.`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openAddDeptForFaculty(activeFaculty._id)}
                        className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-medium text-xs shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Department to{" "}
                        {activeFaculty.code}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {currentFacultyDepartments.map((dept: IDepartment) => {
                      const deptProgs = programmesByDept.get(dept._id) || [];

                      return (
                        <Card
                          key={dept._id}
                          className="border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors py-0 gap-0"
                        >
                          <CardHeader className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-burgundy-50 dark:bg-burgundy-950/50 text-burgundy-700 dark:text-burgundy-300 border border-burgundy-200 dark:border-burgundy-900">
                                  {dept.code}
                                </span>
                                <div>
                                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    {dept.name}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {deptProgs.length}{" "}
                                    {deptProgs.length === 1
                                      ? "Programme"
                                      : "Programmes"}{" "}
                                    Configured
                                  </CardDescription>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setEditingDept(dept);
                                    setEditDeptName(dept.name);
                                    setEditDeptCode(dept.code);
                                    setEditDeptFacultyId(activeFaculty._id);
                                  }}
                                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                >
                                  <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => openAddProgForDept(dept._id)}
                                  className="text-xs font-semibold text-burgundy-700 dark:text-burgundy-400 hover:bg-burgundy-50 dark:hover:bg-burgundy-950/40"
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Add
                                  Programme
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {/* Nested Degree Programmes */}
                          <CardContent className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <div className="space-y-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                                Accredited Programmes
                              </span>

                              {deptProgs.length === 0 ? (
                                <p className="text-xs text-zinc-400 italic py-1">
                                  No degree programmes added yet. Click
                                  &quot;Add Programme&quot; above to enroll
                                  degrees.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {deptProgs.map((prog: IProgramme) => (
                                    <div
                                      key={prog._id}
                                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-2xs group hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                            {prog.name}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                          <span className="font-mono font-medium text-zinc-500">
                                            {prog.code}
                                          </span>
                                          &bull; {prog.degreeType || "B.Sc."}{" "}
                                          &bull; {prog.durationYears || 4} Years
                                        </span>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingProg(prog);
                                          setEditProgName(prog.name);
                                          setEditProgCode(prog.code);
                                          setEditProgDuration(
                                            prog.durationYears || 4,
                                          );
                                          setEditProgDegreeType(
                                            prog.degreeType || "B.Sc.",
                                          );
                                        }}
                                        className="h-6 w-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-60 group-hover:opacity-100"
                                      >
                                        <Pencil className="w-3 h-3" />
                                        <span className="sr-only">
                                          Edit Programme
                                        </span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="text-center py-20 border-dashed">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Select a Faculty to view details
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Choose a faculty from the left directory to explore its
                  operational departments and degree programmes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ================= MODAL: ADD FACULTY ================= */}
      <Dialog open={isFacultyOpen} onOpenChange={setIsFacultyOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateFaculty}>
            <DialogHeader>
              <DialogTitle>Add Academic Faculty</DialogTitle>
              <DialogDescription>
                Create a high-level university faculty / college division.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Faculty Name</Label>
                <Input
                  required
                  placeholder="e.g., Faculty of Natural & Applied Sciences"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Faculty Code</Label>
                <Input
                  required
                  placeholder="e.g., FSC"
                  value={facCode}
                  onChange={(e) => setFacCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Description (Optional)
                </Label>
                <Input
                  placeholder="Brief collegiate description"
                  value={facDesc}
                  onChange={(e) => setFacDesc(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFacultyOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createFacultyMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {createFacultyMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Save Faculty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT FACULTY ================= */}
      <Dialog
        open={Boolean(editingFaculty)}
        onOpenChange={(open) => !open && setEditingFaculty(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateFaculty}>
            <DialogHeader>
              <DialogTitle>Edit Faculty Details</DialogTitle>
              <DialogDescription>
                Update official faculty information for {editingFaculty?.code}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Faculty Name</Label>
                <Input
                  required
                  value={editFacName}
                  onChange={(e) => setEditFacName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Faculty Code</Label>
                <Input
                  required
                  value={editFacCode}
                  onChange={(e) => setEditFacCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                  value={editFacDesc}
                  onChange={(e) => setEditFacDesc(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingFaculty(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateFacultyMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {updateFacultyMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Update Faculty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: ADD DEPARTMENT ================= */}
      <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDepartment}>
            <DialogHeader>
              <DialogTitle>Add Academic Department</DialogTitle>
              <DialogDescription>
                Register an academic department within a parent faculty.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Parent Faculty</Label>
                <select
                  value={deptFacultyId || activeFaculty?._id || ""}
                  onChange={(e) => setDeptFacultyId(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  {faculties.map((f: IFaculty) => (
                    <option key={f._id} value={f._id}>
                      [{f.code}] {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department Name</Label>
                <Input
                  required
                  placeholder="e.g., Department of Computer Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department Code</Label>
                <Input
                  required
                  placeholder="e.g., CSC"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeptOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createDeptMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {createDeptMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Save Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT DEPARTMENT ================= */}
      <Dialog
        open={Boolean(editingDept)}
        onOpenChange={(open) => !open && setEditingDept(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateDepartment}>
            <DialogHeader>
              <DialogTitle>Edit Department Details</DialogTitle>
              <DialogDescription>
                Modify name or parent faculty for {editingDept?.code}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Parent Faculty</Label>
                <select
                  value={editDeptFacultyId}
                  onChange={(e) => setEditDeptFacultyId(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  {faculties.map((f: IFaculty) => (
                    <option key={f._id} value={f._id}>
                      [{f.code}] {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department Name</Label>
                <Input
                  required
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Department Code</Label>
                <Input
                  required
                  value={editDeptCode}
                  onChange={(e) => setEditDeptCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingDept(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateDeptMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {updateDeptMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Update Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: ADD PROGRAMME ================= */}
      <Dialog open={isProgOpen} onOpenChange={setIsProgOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateProgramme}>
            <DialogHeader>
              <DialogTitle>Add Degree Programme</DialogTitle>
              <DialogDescription>
                Accredit a new degree programme under an academic department.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Parent Department
                </Label>
                <select
                  value={progDeptId}
                  onChange={(e) => setProgDeptId(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  {departments.map((d: IDepartment) => (
                    <option key={d._id} value={d._id}>
                      [{d.code}] {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Degree Programme Title
                </Label>
                <Input
                  required
                  placeholder="e.g., Computer Science"
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Programme Code
                  </Label>
                  <Input
                    required
                    placeholder="e.g., CSC-BSC"
                    value={progCode}
                    onChange={(e) => setProgCode(e.target.value)}
                    className="font-mono uppercase text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Degree Type</Label>
                  <select
                    value={progDegreeType}
                    onChange={(e) => setProgDegreeType(e.target.value)}
                    className="w-full text-xs h-9 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <option value="B.Sc.">B.Sc.</option>
                    <option value="B.Eng.">B.Eng.</option>
                    <option value="B.A.">B.A.</option>
                    <option value="M.Sc.">M.Sc.</option>
                    <option value="Ph.D.">Ph.D.</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Standard Duration (Years)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={progDuration}
                  onChange={(e) => setProgDuration(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProgOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createProgMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {createProgMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Save Programme
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: EDIT PROGRAMME ================= */}
      <Dialog
        open={Boolean(editingProg)}
        onOpenChange={(open) => !open && setEditingProg(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateProgramme}>
            <DialogHeader>
              <DialogTitle>Edit Degree Programme</DialogTitle>
              <DialogDescription>
                Modify degree accreditation settings for {editingProg?.code}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Programme Title</Label>
                <Input
                  required
                  value={editProgName}
                  onChange={(e) => setEditProgName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Programme Code
                  </Label>
                  <Input
                    required
                    value={editProgCode}
                    onChange={(e) => setEditProgCode(e.target.value)}
                    className="font-mono uppercase text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Degree Type</Label>
                  <select
                    value={editProgDegreeType}
                    onChange={(e) => setEditProgDegreeType(e.target.value)}
                    className="w-full text-xs h-9 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <option value="B.Sc.">B.Sc.</option>
                    <option value="B.Eng.">B.Eng.</option>
                    <option value="B.A.">B.A.</option>
                    <option value="M.Sc.">M.Sc.</option>
                    <option value="Ph.D.">Ph.D.</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Standard Duration (Years)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={editProgDuration}
                  onChange={(e) => setEditProgDuration(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingProg(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateProgMutation.isPending}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold text-xs"
              >
                {updateProgMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                )}
                Update Programme
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
