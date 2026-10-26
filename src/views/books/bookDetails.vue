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

        <h3>About this book</h3>
        <p>{{ formatDescription(book.description) || 'No description available.' }}</p>
    </article>

    <RouterLink to="/">← Back to books</RouterLink>
</template>

<script>
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
        coverId() {
            return this.book?.covers?.[0] || null
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
        }
    }
}
</script>
