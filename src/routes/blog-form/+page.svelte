<script>
    import { onMount } from "svelte";
    import {
        app,
        getAuth,
        onAuthStateChanged,
        getDatabase,
        database,
        ref,
        set,
        push,
    } from "$lib/firebaseConfig";
    import { goto } from "$app/navigation"; // Better navigation method

    let user = null;

    onMount(() => {
        const auth = getAuth(app);
        onAuthStateChanged(auth, (loggedInUser) => {
            if (loggedInUser) {
                user = { ...loggedInUser };
                if (user.uid === "BUCiqfINDDcxUQRnwi6g2gD3Ww33") {
                    // goto("/login");
                } else {
                    goto("/not-allowed-user");
                }
            } else {
                user = null;
            }
        });
    });
    let quill;
    let editorContent = "";

    onMount(() => {
        const editor = document.getElementById("editor");

        quill = new Quill(editor, {
            debug: "info",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ script: "sub" }, { script: "super" }],
                    [{ color: [] }, { background: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ align: [] }],
                    ["blockquote", "code-block"],
                    ["link", "image", "video"],
                    ["clean"],
                ],
            },
            placeholder: "Compose something amazing...",
            theme: "snow",
        });

        // Handle image uploads with size restriction
        quill.getModule("toolbar").addHandler("image", () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
                const file = input.files[0];
                if (file) {
                    const maxSize = 1 * 1024 * 1024;

                    if (file.size > maxSize) {
                        alert(
                            "Image size exceeds 1MB. Please upload a smaller file.",
                        );
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Image = reader.result;
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, "image", base64Image);
                    };
                    reader.readAsDataURL(file);
                }
            };
        });
    });

    // const saveEditorContent = () => {
    //     editorContent = JSON.stringify(quill.getContents());
    //     console.log("Editor Content (Delta JSON):", editorContent);
    //     alert("Saved Content: " + editorContent);
    // };
    let title, description;
    const saveEditorContent = async () => {
        if (!user) {
            alert("You must be logged in to save.");
            return;
        }

        const db = getDatabase(app);
        const contentRef = ref(db, "editorContents"); // Database path

        // Generate unique key
        const newContentRef = push(contentRef);

        // Get Quill editor content
        editorContent = JSON.stringify(quill.getContents());

        // Save data to Firebase
        await set(newContentRef, {
            id: newContentRef.key, // Unique ID
            userId: user.uid, // Logged-in user's ID
            title: title.value, // Title
            description: description.value, // Description
            content: editorContent, // Quill editor content
            timestamp: Date.now(), // Save timestamp
        });

        console.log("Saved to Firebase:", editorContent);
        alert("Content saved successfully!");
    };
</script>

<svelte:head>
    <link
        href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
        rel="stylesheet"
    />
</svelte:head>

<main>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    <form on:submit|preventDefault={saveEditorContent}>
                        <div class="mb-4">
                            <label class="text-xl text-gray-600">
                                Title <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                class="border-2 border-gray-300 p-2 w-full"
                                name="title"
                                required
                                bind:this={title}
                            />
                        </div>

                        <div class="mb-4">
                            <label class="text-xl text-gray-600"
                                >Description</label
                            >
                            <input
                                type="text"
                                class="border-2 border-gray-300 p-2 w-full"
                                name="description"
                                placeholder="(Optional)"
                                bind:this={description}
                            />
                        </div>

                        <div class="mb-8">
                            <label class="text-xl text-gray-600">
                                Content <span class="text-red-500">*</span>
                            </label>
                            <div
                                id="editor"
                                class="border-2 border-gray-500"
                            ></div>
                        </div>

                        <div class="flex p-1">
                            <select
                                class="border-2 border-gray-300 border-r p-2"
                                name="action"
                            >
                                <option>Save and Publish</option>
                                <option>Save Draft</option>
                            </select>
                            <button
                                type="submit"
                                class="p-3 bg-blue-500 text-white hover:bg-blue-400"
                            >
                                Save Content
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script
        src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
    ></script>
</main>
