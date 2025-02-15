<script>
    import { onMount } from "svelte";
    import { app, getAuth, onAuthStateChanged } from "$lib/firebaseConfig";
    import { goto } from "$app/navigation"; // Better navigation method

    let user = null;

    onMount(() => {
        const auth = getAuth(app);
        onAuthStateChanged(auth, (loggedInUser) => {
            if (loggedInUser) {
                user = { ...loggedInUser };
                if (user.uid !== "BUCiqfINDDcxUQRnwi6g2gD3Ww33") {
                    goto("/login");
                } else {
                    goto("/blog-form");
                }
            } else {
                user = null;
            }
        });
    });
</script>

{#if user}
    <p>Welcome, {user.email}!</p>
{:else}
    <p>No user logged in.</p>
{/if}
