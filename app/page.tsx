"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Button,
    Input,
    Modal,
    Switch,
    Table,
   
    Tooltip,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useGetTodos,
    useDeleteTodo,
    useCheckStatus,
    useAddTodo,
    useEditTodo,
    useDeleteImage,
    useAddImage,
} from "@/hooks/useTodo";
import { IData, IAddTodo, IEditTodo } from "@/types/todo";

// ─── Column helper types ──────────────────────────────────────────────────────

interface EditState {
    open: boolean;
    record: IData | null;
}

export default function Home() {
    // ── State ──────────────────────────────────────────────────────────────────
    const [addModal, setAddModal] = useState(false);
    const [editState, setEditState] = useState<EditState>({ open: false, record: null });

    // ── Queries ────────────────────────────────────────────────────────────────
    const { data, isPending, isError, error } = useGetTodos();

    // Live record: always in sync with query cache so images update after mutation
    const liveEditRecord = editState.record
        ? (data?.data?.find((d) => d.id === editState.record!.id) ?? editState.record)
        : null;

    // ── Mutations ──────────────────────────────────────────────────────────────
    const { mutate: deleteTodo } = useDeleteTodo();
    const { mutate: checkStatus } = useCheckStatus();
    const { mutate: addTodo, isPending: isAdding } = useAddTodo();
    const { mutate: editTodo, isPending: isEditing } = useEditTodo();
    const { mutate: deleteImage } = useDeleteImage();
    const { mutate: addImage, isPending: isUploadingImg } = useAddImage();

    // ── Image upload ref ───────────────────────────────────────────────────────
    const imgInputRef = useRef<HTMLInputElement>(null);

    // ── Add form ───────────────────────────────────────────────────────────────
    const {
        control: addControl,
        handleSubmit: handleAdd,
        reset: resetAdd,
        register: registerAdd,
    } = useForm<IAddTodo>();

    // ── Edit form ──────────────────────────────────────────────────────────────
    const {
        control: editControl,
        handleSubmit: handleEdit,
        reset: resetEdit,
    } = useForm<Omit<IEditTodo, 'id'>>();

    // ── Handlers ───────────────────────────────────────────────────────────────

    const onAddSubmit = (values: IAddTodo) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description);
        if (values.images && values.images.length > 0) {
            Array.from(values.images).forEach((file) => {
                formData.append("images", file);
            });
        }
        addTodo(formData, {
            onSuccess: () => {
                setAddModal(false);
                resetAdd();
            },
        });
    };

    const openEditModal = (record: IData) => {
        resetEdit({ name: record.name, description: record.description });
        setEditState({ open: true, record });
    };

    const onEditSubmit = (values: Omit<IEditTodo, 'id'>) => {
        if (!editState.record) return;
        editTodo(
            { id: editState.record.id, ...values },
            {
                onSuccess: () => {
                    setEditState({ open: false, record: null });
                    resetEdit();
                },
            }
        );
    };

    // ── Table columns ──────────────────────────────────────────────────────────

    const columns: ColumnsType<IData> = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            width: 60,
        },
        {
            title: "Name & Images",
            key: "name",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    {record.images?.map((img) => (
                        <img
                            key={img.id}
                            src={`http://37.27.29.18:8001/images/${img.imageName}`}
                            alt={img.imageName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ))}
                    <span className="font-medium">{record.name}</span>
                </div>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Status",
            key: "isCompleted",
            render: (_, record) =>
                record.isCompleted ? (
                    <span className="text-green-600 font-semibold">Active</span>
                ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    {/* Delete todo */}
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteTodo(record.id)}
                        />
                    </Tooltip>

                    {/* Edit todo */}
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1677ff' }} />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    {/* Toggle status */}
                    <Switch
                        checked={record.isCompleted}
                        onChange={() => checkStatus(record.id)}
                    />
                </div>
            ),
        },
    ];


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6"> Todo List (TanStack Query)</h1>

            {/* Add button */}
            <Button 
                type="primary"
                className="mb-4"
                onClick={() => setAddModal(true)}
            >
                + Add Todo
            </Button>

            {/* Main table */}
            <Table
                columns={columns}
                dataSource={data?.data ?? []}          
                rowKey="id"
                className="w-full"
                pagination={{ pageSize: 10 }}
            />

            {/* ─── ADD Modal ─────────────────────────────────────────────────── */}
            <Modal
                title="Add New Todo"
                open={addModal}
                onCancel={() => {
                    setAddModal(false);
                    resetAdd();
                }}
                footer={null}
                closable={{ "aria-label": "Close Add Modal" } as any}
            >
                <form onSubmit={handleAdd(onAddSubmit)} className="flex flex-col gap-3 mt-2">
                    <Controller
                        name="name"
                        control={addControl}
                        render={({ field }) => (
                            <Input placeholder="Name..." {...field} />
                        )}
                    />

                    <Controller
                        name="description"
                        control={addControl}
                        render={({ field }) => (
                            <Input placeholder="Description..." {...field} />
                        )}
                    />

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Images (optional)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            {...registerAdd("images")}
                            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <Button type="primary" htmlType="submit" loading={isAdding} block>
                        Save
                    </Button>
                </form>
            </Modal>

            {/* ─── EDIT Modal ─────────────────────────────────────────────────── */}
            <Modal
                title="Edit Todo"
                open={editState.open}
                onCancel={() => {
                    setEditState({ open: false, record: null });
                    resetEdit();
                }}
                footer={null}
                closable={{ "aria-label": "Close Edit Modal" } as any}
            >
                <form onSubmit={handleEdit(onEditSubmit)} className="flex flex-col gap-3 mt-2">
                    <Controller
                        name="name"
                        control={editControl}
                        render={({ field }) => (
                            <Input placeholder="Name..." {...field} />
                        )}
                    />

                    <Controller
                        name="description"
                        control={editControl}
                        render={({ field }) => (
                            <Input placeholder="Description..." {...field} />
                        )}
                    />

                    <Button type="primary" htmlType="submit" loading={isEditing} block>
                        Update
                    </Button>
                </form>

                {/* ── Image management ───────────────────────────────────────── */}
                <div className="mt-4 border-t pt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Images</p>

                    {/* Existing images */}
                    <div className="flex flex-wrap gap-3 mb-3">
                        {liveEditRecord?.images?.length ? (
                            liveEditRecord.images.map((img) => (
                                <div key={img.id} className="relative group">
                                    <img
                                        src={`http://37.27.29.18:8001/images/${img.imageName}`}
                                        alt={img.imageName}
                                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                    />
                                    <Tooltip title="Delete image">
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(img.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            <DeleteOutlined style={{ fontSize: 10 }} />
                                        </button>
                                    </Tooltip>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No images</p>
                        )}
                    </div>

                    {/* Add new images */}
                    <div className="flex items-center gap-2">
                        <input
                            ref={imgInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (!liveEditRecord || !e.target.files?.length) return;
                                const formData = new FormData();
                                Array.from(e.target.files).forEach((file) =>
                                    formData.append("images", file)
                                );
                                addImage(
                                    { id: liveEditRecord.id, formData },
                                    { onSuccess: () => { if (imgInputRef.current) imgInputRef.current.value = ""; } }
                                );
                            }}
                        />
                        <Button
                            type="dashed"
                            icon={isUploadingImg ? <UploadOutlined spin /> : <PlusOutlined />}
                            loading={isUploadingImg}
                            onClick={() => imgInputRef.current?.click()}
                            block
                        >
                            Add Images
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}





























