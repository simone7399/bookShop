<template>
    <h1>Books</h1>

    <div class="search-bar">
        <input
            v-model="searchQuery"
            type="search"
            placeholder="Search books or authors…"
            @input="onSearchInput"
        />
        <button
            v-if="searchQuery"
            type="button"
            class="clear-btn"
            aria-label="Clear search"
            @click="clearSearch"
        >
            ✕
        </button>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error-message">{{ error }}</p>

    <!-- SEARCH MODE -->
    <template v-if="searchQuery.trim()">
        <p v-if="searching" class="status-line">Searching…</p>
        <p v-else-if="searchError" class="error-message">{{ searchError }}</p>
        <template v-else>
            <h2>Results for "{{ lastSearchedQuery }}"</h2>

            <p v-if="searchResults.length === 0" class="status-line">
                No results found.
            </p>

            <div v-else class="row">
                <RouterLink
                    v-for="book in searchResults"
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
                    <p class="author">{{ book.author }}</p>
                </RouterLink>
            </div>
        </template>
    </template>

    <!-- BROWSE MODE -->
    <template v-else>
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
            ],

            // Search state
            searchQuery: '',
            lastSearchedQuery: '',
            searchResults: [],
            searching: false,
            searchError: null,
            debounceTimer: null
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

    beforeUnmount() {
        // Don't fire a search after the user leaves the page
        clearTimeout(this.debounceTimer)
    },

    methods: {
        coverUrl(id) {
            return `https://covers.openlibrary.org/b/id/${id}-M.jpg`
        },

        onSearchInput() {
            clearTimeout(this.debounceTimer)

            const q = this.searchQuery.trim()
            if (!q) {
                // Reset search state so browse mode returns instantly
                this.searchResults = []
                this.searchError = null
                this.lastSearchedQuery = ''
                return
            }

            // Debounce: wait 350ms after the user stops typing
            this.debounceTimer = setTimeout(() => this.runSearch(q), 350)
        },

        async runSearch(query) {
            this.searching = true
            this.searchError = null

            try {
                const res = await fetch(
                    `https://openlibrary.org/search.json?q=${encodeURIComponent(
                        query
                    )}&limit=24`
                )
                if (!res.ok) throw new Error('Search failed')

                const data = await res.json()

                // Guard against a stale response overwriting newer results
                if (query !== this.searchQuery.trim()) return

                this.lastSearchedQuery = query
                this.searchResults = (data.docs || []).map((d) => ({
                    id: d.key.replace('/works/', ''),
                    title: d.title,
                    author: (d.author_name || []).join(', ') || 'Unknown',
                    coverId: d.cover_i
                }))
            } catch (e) {
                this.searchError = e.message
                this.searchResults = []
            } finally {
                this.searching = false
            }
        },

        clearSearch() {
            clearTimeout(this.debounceTimer)
            this.searchQuery = ''
            this.searchResults = []
            this.searchError = null
            this.lastSearchedQuery = ''
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

.author {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    line-height: 1.35;
}

/* --- Search bar --- */

.search-bar {
    position: relative;
    max-width: 480px;
    margin: 1rem 0 1.75rem;
}

.search-bar input {
    width: 100%;
    padding: 0.7rem 2.5rem 0.7rem 1rem;
    font-size: 1rem;
    font-family: var(--font-ui);
    color: var(--color-text);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    outline: none;
    transition: border-color 180ms ease;
}

.search-bar input:focus {
    border-color: var(--color-accent);
}

.search-bar input::placeholder {
    color: var(--color-text-muted);
}

/* Hide the browser's native clear button on <input type="search"> */
.search-bar input::-webkit-search-cancel-button {
    display: none;
}

.clear-btn {
    position: absolute;
    right: 0.4rem;
    top: 50%;
    transform: translateY(-50%);
    padding: 0.25rem 0.55rem;
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.95rem;
    cursor: pointer;
    transition: color 180ms ease;
}

.clear-btn:hover {
    color: var(--color-accent);
}

.status-line {
    color: var(--color-text-muted);
    font-style: italic;
}
</style>