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

        <!-- Not on shelf: add button -->
        <button
            v-if="!isOnBookshelf"
            class="bookshelf-btn add"
            :disabled="loading"
            @click="addToBookshelf"
        >
            + Add to Bookshelf
        </button>

        <!-- On shelf: status selector + remove -->
        <div v-else class="bookshelf-controls">
            <label>
                Status:
                <select :value="currentStatus" @change="changeStatus">
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
            </label>

            <button class="bookshelf-btn remove" @click="removeFromBookshelf">
                ✕ Remove
            </button>
        </div>

        <h3>About this book</h3>
        <p>{{ formatDescription(book.description) || 'No description available.' }}</p>
    </article>

    <div class="nav-links">
        <RouterLink to="/">← Back to books</RouterLink>
        <RouterLink to="/bookshelf">View my bookshelf →</RouterLink>
    </div>
</template>

<script>
import { useBookshelfStore, STATUS_OPTIONS } from '@/stores/bookshelf'

export default {
    props: ['id'],

    data() {
        return {
            book: null,
            author: '',
            loading: true,
            error: null,
            statusOptions: STATUS_OPTIONS
        }
    },

    computed: {
        bookshelf() {
            return useBookshelfStore()
        },

        coverId() {
            return this.book?.covers?.[0] || null
        },

        isOnBookshelf() {
            return this.book ? this.bookshelf.isOnBookshelf(this.book.key) : false
        },

        currentStatus() {
            return this.book ? this.bookshelf.getStatus(this.book.key) : null
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

        // Normalise the work object into the shape the bookshelf expects
        bookPayload() {
            return {
                key: this.book.key,
                title: this.book.title,
                cover_i: this.coverId,
                author_name: this.author ? [this.author] : []
            }
        },

        addToBookshelf() {
            if (!this.book) return
            this.bookshelf.addBook(this.bookPayload()) // defaults to TBR
        },

        changeStatus(event) {
            this.bookshelf.setStatus(this.book.key, event.target.value)
        },

        removeFromBookshelf() {
            this.bookshelf.removeBook(this.book.key)
        }
    }
}
</script>

<style scoped>
.bookshelf-btn {
    display: inline-block;
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
    margin: 1rem 0;
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

.bookshelf-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
}

.bookshelf-controls select {
    padding: 0.4rem 0.6rem;
    font-size: 1rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
    margin-top: 2rem;
}
</style>