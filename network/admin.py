from django.contrib import admin
from .models import User, UpPost, Comment, React, Profile, Follow

# Register your models here.
class ProfileAdmin(admin.TabularInline):
    model = Profile

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "password")
    inlines = [ProfileAdmin]


class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "date")

class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "content", "date")

class ReactAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "comment")

admin.site.register(User, UserAdmin)
admin.site.register(UpPost, PostAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(React, ReactAdmin)
admin.site.register(Follow)
