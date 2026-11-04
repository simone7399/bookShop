<template>
    <h1>Book Details</h1>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    <article v-if="book">
        <h2>{{ book.title }}</h2>

        <img
            v-if="coverId"
            :src="`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`"
            :alt="book.title"
            style="max-width: 200px"
        />

        <p><strong>Author:</strong> {{ author || 'Unknown' }}</p>

        <button
            class="bookshelf-btn"
            :class="isOnBookshelf ? 'remove' : 'add'"
            :disabled="loading"
            @click="toggleBookshelf"
        >
            {{ isOnBookshelf ? '✓ Remove from Bookshelf' : '+ Add to Bookshelf' }}
        </button>

        <h3>About this book</h3>
        <p>{{ formatDescription(book.description) || 'No description available.' }}</p>
    </article>

    <div class="nav-links">
        <RouterLink to="/">← Back to books</RouterLink>
        <RouterLink to="/bookshelf">View my bookshelf →</RouterLink>
    </div>
</template>

<script>
import { useBookshelfStore } from '@/stores/bookshelf'

export default {
    props: ['id'],

    data() {
        return {
            book: null,
            author: '',
            loading: true,
            error: null
        }
    },

    computed: {
        // Access the store via a computed so it stays reactive in Options API
        bookshelf() {
            return useBookshelfStore()
        },

        coverId() {
            return this.book?.covers?.[0] || null
        },

        // Is the current book already saved?
        isOnBookshelf() {
            return this.book ? this.bookshelf.isOnBookshelf(this.book.key) : false
        }
    },

    async mounted() {
        try {
            const res = await fetch(
                `https://openlibrary.org/works/${this.id}.json`
            )
            if (!res.ok) throw new Error('Could not load book')
            this.book = await res.json()

            if (this.book.authors && this.book.authors.length > 0) {
                const key = this.book.authors[0].author.key
                const aRes = await fetch(`https://openlibrary.org${key}.json`)
                if (aRes.ok) {
                    const aData = await aRes.json()
                    this.author = aData.name
                }
            }
        } catch (e) {
            this.error = e.message
        } finally {
            this.loading = false
        }
    },

    methods: {
        formatDescription(desc) {
            if (!desc) return ''
            return typeof desc === 'string' ? desc : desc.value || ''
        },

        toggleBookshelf() {
            if (!this.book) return

            // Open Library's "work" object has a different shape than what
            // the bookshelf page expects, so we normalise it here.
            const bookToSave = {
                key: this.book.key,
                title: this.book.title,
                cover_i: this.coverId,
                author_name: this.author ? [this.author] : []
            }

            this.bookshelf.toggleBook(bookToSave)
        }
    }
}
</script>

<style scoped>
.bookshelf-btn {
    display: inline-block;
    margin: 1rem 0;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.bookshelf-btn.add {
    background: #2563eb;
    color: #fff;
}

.bookshelf-btn.add:hover {
    background: #1d4ed8;
}

.bookshelf-btn.remove {
    background: #fff;
    color: #b91c1c;
    border-color: #b91c1c;
}

.bookshelf-btn.remove:hover {
    background: #fee2e2;
}

.bookshelf-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
    margin-top: 2rem;
}
</style>