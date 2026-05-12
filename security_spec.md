# Security Specification for Aura Gallery

## Data Invariants
1. An image must belong to an existing album and have a valid URL.
2. Albums and Images can only be read/written by their owners.
3. Users must be authenticated and email-verified to perform any write operation.
4. Timestamps must be server-generated.

## The Dirty Dozen Payloads

1. **Identity Theft**: Create an album with a different `userId`.
2. **Orphaned Image**: Create an image pointing to a non-existent `albumId`.
3. **Cross-Album Poisoning**: Create an image for an album owned by another user.
4. **Shadow Update**: Add a `isSystemAdmin: true` field to a user-owned document.
5. **Timestamp Spoofing**: Provide a manual `createdAt` date from 2020.
6. **ID Injection**: Create a document with a 2MB string as ID.
7. **Empty URL**: Create an image with an empty or non-string URL.
8. **Malicious Metadata**: Inject HTML/Script into `description`. (Rules should limit size to prevent performance drain).
9. **No Auth Write**: Attempt to create an album without being signed in.
10. **Unverified Auth Write**: Attempt to write with a non-verified email.
11. **Album Deletion Leak**: Try to delete another user's album.
12. **Blind List**: Query all images without filtering by `userId`.

## Tests
I'll implement the rules and then verify with a test mindset (conceptualizing the tests).
