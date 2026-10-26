<template>
    <h1>Books</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <section v-for="section in sections" :key="section.slug">
        <h2>{{ section.label }}</h2>

        <div class="row">
            <RouterLink
                v-for="book in section.books"
                :key="book.id"
                :to="{ name: 'bookDetails', params: { id: book.id } }"
                class="card"
            >
                <img
                    v-if="book.coverId"
                    :src="coverUrl(book.coverId)"
                    :alt="book.title"
                />
                <div v-else class="cover-placeholder">No cover</div>

                <h3>{{ book.title }}</h3>
            </RouterLink>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            loading: true,
            error: null,
            sections: [
                { label: 'Classics', slug: 'classics', books: [] },
                { label: 'Science Fiction', slug: 'science_fiction', books: [] },
                { label: 'Fantasy', slug: 'fantasy', books: [] },
                { label: 'Poetry', slug: 'poetry', books: [] },
                { label: 'Romance', slug: 'romance', books: [] }
            ]
        }
    },

    async mounted() {
        try {
            await Promise.all(
                this.sections.map(async (section) => {
                    const res = await fetch(
                        `https://openlibrary.org/subjects/${section.slug}.json?limit=12`
                    )
                    if (!res.ok) throw new Error(`Failed to load ${section.label}`)
                    const data = await res.json()

                    section.books = (data.works || []).map((w) => ({
                        id: w.key.replace('/works/', ''),
                        title: w.title,
                        author:
                            (w.authors || []).map((a) => a.name).join(', ') ||
                            'Unknown',
                        coverId: w.cover_id
                    }))
                })
            )
        } catch (e) {
            this.error = e.message
        } finally {
            this.loading = false
        }
    },

    methods: {
        coverUrl(id) {
            return `https://covers.openlibrary.org/b/id/${id}-M.jpg`
        }
    }
}
</script>

<style scoped>
.row {
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    padding: 0.15rem 0.15rem 1.25rem;
    scrollbar-color: var(--color-border-strong) transparent;
    scrollbar-width: thin;
}

.card {
    flex: 0 0 148px;
    min-width: 148px;
    text-decoration: none;
    color: var(--color-text);
    text-align: left;
    transition: transform 180ms ease;
}

.card:hover {
    color: var(--color-accent);
    transform: translateY(-4px);
}

.card img {
    display: block;
    width: 100%;
    height: 218px;
    object-fit: cover;
    border: 1px solid var(--color-border-strong);
    background: var(--color-surface-raised);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
    transition: border-color 180ms ease, box-shadow 180ms ease;
}

.card:hover img {
    border-color: var(--color-accent-soft);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.4);
}

.cover-placeholder {
    width: 100%;
    height: 218px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px solid var(--color-border);
    background:
        linear-gradient(145deg, transparent 48%, rgba(194, 166, 107, 0.06) 49%, transparent 50%),
        var(--color-surface-raised);
    color: var(--color-text-muted);
    font-family: var(--font-ui);
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-align: center;
    text-transform: uppercase;
}

.card h3 {
    margin: 0.8rem 0 0;
    font-size: 0.95rem;
    line-height: 1.45;
}
</style>