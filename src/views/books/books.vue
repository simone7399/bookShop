<template>
    <h1>Books</h1>

    <div class="toolbar">
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

        <nav
            v-if="!loading && !error"
            class="category-tabs"
            aria-label="Book categories"
        >
            <button
                v-for="section in sections"
                :key="section.slug"
                type="button"
                class="category-tab"
                :class="{
                    active: !searchQuery.trim() && section.slug === activeCategory
                }"
                @click="selectCategory(section.slug)"
            >
                {{ section.label }}
            </button>
        </nav>
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

            <div v-else class="grid">
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

    <!-- BROWSE MODE (single active category) -->
    <template v-else>
        <p v-if="activeBooks.length === 0" class="status-line">
            No books in this category yet.
        </p>

        <div v-else class="grid">
            <RouterLink
                v-for="book in activeBooks"
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

            activeCategory: 'classics',

            searchQuery: '',
            lastSearchedQuery: '',
            searchResults: [],
            searching: false,
            searchError: null,
            debounceTimer: null
        }
    },

    computed: {
        activeBooks() {
            const section = this.sections.find(
                (s) => s.slug === this.activeCategory
            )
            return section ? section.books : []
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
        clearTimeout(this.debounceTimer)
    },

    methods: {
        coverUrl(id) {
            return `https://covers.openlibrary.org/b/id/${id}-M.jpg`
        },

        selectCategory(slug) {
            this.clearSearch()
            this.activeCategory = slug
        },

        onSearchInput() {
            clearTimeout(this.debounceTimer)

            const q = this.searchQuery.trim()
            if (!q) {
                this.searchResults = []
                this.searchError = null
                this.lastSearchedQuery = ''
                return
            }

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
/* --- Toolbar: search bar + tabs on one row, full-width divider below --- */

.toolbar {
    --control-height: 44px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin: 1rem 0 1.75rem;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid var(--color-border);
}

/* --- Search bar --- */

.search-bar {
    position: relative;
    flex: 0 1 300px;
    min-width: 200px;
    height: var(--control-height);
}

.search-bar input {
    width: 100%;
    height: 100%;
    padding: 0 2.5rem 0 1rem;
    font-size: 0.95rem;
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

/* --- Category tabs (match input height + radius) --- */

.category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    flex: 1 1 auto;
}

.category-tab {
    height: var(--control-height);
    padding: 0 1rem;
    display: inline-flex;
    align-items: center;
    font-family: var(--font-ui);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    transition: color 180ms ease, border-color 180ms ease,
        background 180ms ease;
}

.category-tab:hover {
    color: var(--color-text);
    border-color: var(--color-accent);
}

.category-tab.active {
    color: var(--color-accent);
    border-color: var(--color-accent);
    background: var(--color-surface-raised);
}

/* --- Book grid (vertical scroll) --- */

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 1.5rem 1.25rem;
    padding: 0.15rem 0.15rem 2rem;
}

.card {
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

.status-line {
    color: var(--color-text-muted);
    font-style: italic;
}
</style>