from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.enums import Choices
from django_countries.fields import CountryField
from .util import resize_img


class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=120, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    country = CountryField(blank= True, null=True)
    img = models.ImageField(default="pro_pics/default.png", upload_to="pro_pics")
    about = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        resize_img(self.img.path, 650, 650)

class UpPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="posted by", related_name="posts")
    content = models.TextField(blank=False)
    date = models.DateTimeField(auto_now_add=True, null=False, blank=True, verbose_name="posted on")

    class Meta:
        verbose_name="post"
        verbose_name_plural = "posts"
    def __str__(self):
        return f"UpPost {self.id} created by {self.user} on {self.date.strftime('%d %b %Y %H:%M:%S')}"

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="commented by")
    post = models.ForeignKey(UpPost, related_name="comments", on_delete=models.CASCADE)
    content = models.TextField(blank=False)
    date = models.DateTimeField(null=False, blank=True, auto_now_add=True, verbose_name="commented on")

    class Meta:
        verbose_name = "comment"
        verbose_name_plural = "comments"
        ordering = ["date"]
    def __str__(self):
        return f"Comment {self.id} commented by {self.user} on post {self.post_id} on {self.date.strftime('%d %b %Y %H:%M:%S')}"

class React(models.Model):
    
    choices = [
        (1, "like"),
        (2, "heart"),
        (3, "haha"),
        (4, "thanks"),
        (5, "dislike")
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="reacted by")
    post = models.ForeignKey(UpPost, related_name="react", null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, related_name="react", null=True, blank=True, on_delete=models.CASCADE)
    react_type = models.IntegerField(choices=choices, default=1)

    class Meta:
        verbose_name = "react"
        verbose_name_plural = "reacts"
        unique_together = [["user", "post"], ["user", "comment"]]
        ordering = ["react_type"]
    def __str__(self):
        elem = self.post if (self.post is not None) else self.comment
        return f"React {self.id} by {self.user} on object {elem}"

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follow")
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    class Meta:
        verbose_name = "following"
        verbose_name_plural = "followings"
        unique_together = ["user", "followed"]
    def __str__(self):
        return f"{self.user} is following {self.followed}"
    def followed_post(self):
        return self.followed.posts.order_by("-date").all()
