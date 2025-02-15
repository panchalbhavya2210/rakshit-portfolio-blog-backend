<!-- <script>
    import {
        app,
        getAuth,
        signInWithEmailAndPassword,
        sendPasswordResetEmail,
        setPersistence,
        browserLocalPersistence,
    } from "$lib/firebaseConfig";

    let email, password;
    const loginUser = async () => {
        const auth = getAuth(app);

        setPersistence(auth, browserLocalPersistence) // Ensures persistence across sessions
            .then(() => {
                return signInWithEmailAndPassword(
                    auth,
                    email.value,
                    password.value,
                );
            })
            .then((res) => {
                alert("Login successful!");

                if (res.user.uid) {
                    window.location.replace("/"); // Redirect to home
                }
            })
            .catch((err) => {
                alert(err.message);
            });
    };

    const sendForgotPassword = async () => {
        sendPasswordResetEmail(getAuth(app), email.value)
            .then(() => {
                alert("Password reset email sent");
            })
            .catch((err) => {
                alert(err);
            });
    };
</script>

<main>
    <section class="bg-gray-50 dark:bg-gray-900 h-dvh">
        <div
            class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
        >
            <div
                class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
            >
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1
                        class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
                    >
                        Sign in to your account
                    </h1>
                    <div>
                        <label
                            for="email"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Your email</label
                        >
                        <input
                            type="email"
                            name="email"
                            id="email"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="name@company.com"
                            required=""
                            bind:this={email}
                        />
                    </div>
                    <div>
                        <label
                            for="password"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Password</label
                        >
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required=""
                            bind:this={password}
                        />
                    </div>
                    <div class="flex items-center justify-between">
                        <button
                            on:click={sendForgotPassword}
                            class="text-sm font-medium text-blue-600 hover:underline dark:text-primary-500"
                            >Forgot password?</button
                        >
                    </div>
                    <button
                        on:click={loginUser}
                        class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 cursor-pointer"
                        >Sign in</button
                    >
                    <p
                        class="text-sm font-light text-gray-500 dark:text-gray-400"
                    >
                        Don’t have an account yet? <a
                            href="/register"
                            class="font-medium text-primary-600 hover:underline dark:text-primary-500"
                            >Sign up</a
                        >
                    </p>
                </div>
            </div>
        </div>
    </section>
</main> -->

<script>
    import { onMount, tick } from "svelte";
    import Quill from "quill";
    import { getDatabase, ref, onValue } from "$lib/firebaseConfig";

    let editorEntries = [];

    // 🔹 Fetch Data from Firebase
    const readEditorContents = () => {
        const db = getDatabase();
        const contentRef = ref(db, "editorContents");

        onValue(contentRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // 🔥 Convert object to array
                editorEntries = Object.entries(data).map(([id, entry]) => ({
                    id,
                    content: JSON.parse(entry.content),
                    renderedHTML: "",
                    headings: [],
                }));

                await tick(); // ⏳ Wait for DOM update
                updateRenderedHTML();
            } else {
                console.log("No data available");
            }
        });
    };

    // 🛠️ Convert Quill Delta to HTML & Extract Headings
    const updateRenderedHTML = async () => {
        editorEntries = editorEntries.map((entry) => {
            const tempQuill = new Quill(document.createElement("div"));
            tempQuill.setContents(entry.content);
            const renderedHTML = tempQuill.root.innerHTML;

            return {
                ...entry,
                renderedHTML,
                headings: [],
            };
        });

        await tick(); // Ensure DOM updates

        editorEntries = editorEntries.map((entry) => {
            const contentDiv = document.getElementById(`content-${entry.id}`);
            let headings = [];

            if (contentDiv) {
                const headingElements =
                    contentDiv.querySelectorAll("h1, h2, h3");

                headings = Array.from(headingElements).map((el, index) => {
                    const id = `heading-${entry.id}-${index}`;
                    el.setAttribute("id", id);
                    return {
                        id,
                        text: el.innerText || "Untitled",
                        tag: el.tagName.toLowerCase(),
                    };
                });
            }

            return {
                ...entry,
                headings,
            };
        });
    };

    onMount(() => {
        readEditorContents(); // 📡 Start real-time listener
    });

    // 📌 Smooth scroll to a specific heading
    const scrollToHeading = (id) => {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
</script>

<svelte:head>
    <style>
        .toc {
            position: fixed;
            top: 20px;
            left: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            max-height: 90vh;
            overflow-y: auto;
        }
        h1,
        h2 {
            height: 100vh;
        }
        .toc h3 {
            margin-bottom: 10px;
        }
        .toc ul {
            list-style: none;
            padding: 0;
        }
        .toc li {
            margin: 5px 0;
            cursor: pointer;
            color: blue;
            text-decoration: underline;
        }
        .entry {
            margin-bottom: 40px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
        }
    </style>
</svelte:head>

<main>
    <!-- 📌 Sidebar for Table of Contents -->
    <div class="toc">
        <h3>Table of Contents</h3>
        <ul>
            {#each editorEntries as entry}
                <li on:click={() => scrollToHeading(entry.headings[0]?.id)}>
                    {entry.headings[0]?.text || "Untitled Blog"}
                </li>
            {/each}
        </ul>
    </div>

    <!-- ✍️ Render Multiple Blog Entries -->
    <h2>Rendered Content</h2>
    {#each editorEntries as entry}
        <div id={`content-${entry.id}`} class="entry">
            {@html entry.renderedHTML}
        </div>
    {/each}
</main>
