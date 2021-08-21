import django
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models.deletion import DO_NOTHING
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
import json
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
from itertools import chain

from .models import User, Profile, UpPost, Comment, React, Follow
from .process import ProcProfile, ProcPost, ProcComment

def index(request):
    alls = UpPost.objects.order_by("-date").all()
    paginator = Paginator(alls, 10)
    page_num = request.GET.get('page')
    page_obj = paginator.get_page(page_num)
    return render(request, "network/index.html", {"post_form": ProcPost(), "comment_form": ProcComment(auto_id=False), "page_obj": page_obj, "availability":True})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": _("Invalid username and/or password.")
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": _("Passwords must match.")
            })
        elif  (not username) or (not email) or (not password):
            return render(request, "network/register.html", {
                "message": _("You must fill out all fields.")
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": _("Username already taken.")
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def ppost(request, act):
    if request.method == "GET":
        return HttpResponse(status=405)
    if request.method == "POST":
        if act == "post":
            form = ProcPost(request.POST)
            if form.is_valid():
                content = form.cleaned_data["content"]
                post = UpPost(user=User.objects.get(pk=request.user.id), content=content)
                post.save()
        elif act == "comment":
            form = ProcComment(request.POST)
            if form.is_valid():
                content = form.cleaned_data["content"]
                try:
                    post = UpPost.objects.get(pk=request.POST.get('post_id'))
                except UpPost.DoesNotExist:
                    return HttpResponse(status=404)
                comment = Comment(user=User.objects.get(pk=request.user.id),content=content,post=post)
                comment.save()
        return HttpResponseRedirect(request.headers['Referer'])
    if request.method == "PUT":
        body = json.loads(request.body)
        try:
            if act == "post":
                edit = UpPost.objects.get(pk=body.get('id'), user=request.user)
            else:
                edit = Comment.objects.get(pk=body.get('id'), user=request.user)
        except (UpPost.DoesNotExist, Comment.DoesNotExist):
            return JsonResponse({"error":_("Post or Comment may have deleted or removed")}, status=404)
        edit.content = body.get('content')
        edit.save()
        return HttpResponse(status=201)
    if request.method == "DELETE":
        body = json.loads(request.body)
        try:
            if act == "post":
                delete = UpPost.objects.get(pk=body.get('id'), user=request.user)
            else:
                delete = Comment.objects.get(pk=body.get('id'), user=request.user)
        except (UpPost.DoesNotExist, Comment.DoesNotExist):
            return JsonResponse({"error":_("Post or Comment may have deleted or removed")},status=404)
        delete.delete()
        return HttpResponse(status=204)

@login_required
def profile(request, id):
    data = User.objects.get(pk=id)
    posts = data.posts.order_by("-date").all()
    followingId = Follow.objects.filter(user=id).values_list('followed',flat=True)
    followersId = Follow.objects.filter(followed=id).values_list('id',flat=True)
    followingUser = User.objects.filter(id__in = followingId)
    followersUser = User.objects.filter(id__in = followersId)
    paginator = Paginator(posts, 10)
    page_num = request.GET.get('page')
    page_obj = paginator.get_page(page_num)
    return render(request, "network/profile.html", {"data": data, "following": followingUser, "followerss": followersUser, "page_obj": page_obj, "comment":ProcComment(auto_id=False)})

@login_required
def edit(request):
    if request.method == "POST":
        if request.POST.get("cancel") == "clicked":
            return HttpResponseRedirect(reverse("profile", args=[request.user.id]))
        form = ProcProfile(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            new = Profile.objects.get(user=request.user.id)
            new.name = form.cleaned_data.get("name")
            new.dob = form.cleaned_data.get("dob")
            new.country = form.cleaned_data.get("country")
            new.about = form.cleaned_data.get("about")
            if len(request.FILES) == 1:
                new.img == request.FILES['img']
            new.save()
            return HttpResponseRedirect(reverse("profile", args=[request.user.id]))
        else:
            return render(request, "network/edit.html",{"form":form,"max":settings.MAX})
    return render(request, "network/edit.html", {"form": ProcProfile(instance=request.user.profile), "max":settings.MAX})

@login_required
def react(request, act, actId):
    if request.method == "GET":
        try:
            if act == "post":
                post = UpPost.objects.get(pk=actId)
                react_obj = React.objects.get(user=request.user, post=post)
            elif act == "comment":
                comment = Comment.objects.get(pk=actId)
                react_obj = React.objects.get(user=request.user, comment=comment)
            else:
                return JsonResponse({"error":_("Action not justified. You can not react anything except post or comment!")}, status=400)
        except React.DoesNotExist:
            return JsonResponse({"react":"False"}, status=200)
        except ( UpPost.DoesNotExist, Comment.DoesNotExist ):
            return JsonResponse({"error":_("Post or comment may have deleted or removed")}, status=404)
        else:
            return JsonResponse({"react":"True", "emoji": [emoji_tuple[1] for emoji_tuple in React.choices if emoji_tuple[0] == react_obj.react_type][0]}, status=200)
        return JsonResponse({"error":_(f"Something went wrong")}, status=400)
    elif request.method == "POST":
        body = json.loads(request.body)
        react_type = [emoji_tuple[0] for emoji_tuple in React.choices if emoji_tuple[1] == body['emoji']][0]
        try:
            if act == "post":
                post = UpPost.objects.get(pk=actId)
                react_obj = React(user=request.user, post=post, react_type=react_type)
            elif act == "comment":
                comment = Comment.objects.get(pk=actId)
                react_obj = React(user=request.user, comment=comment, react_type=react_type)
            else:
                return JsonResponse({"error":_("Action not justified. You can not react anything except post or comment")}, status=400)
        except ( UpPost.DoesNotExist, Comment.DoesNotExist ):
            return JsonResponse({"error":_("Post or comment may have deleted")}, status=404)
        react_obj.save()
        return HttpResponse(status=201)
    elif request.method == "PUT":
        body = json.loads(request.body)
        react_num = [emoji_tuple[0] for emoji_tuple in React.choices if emoji_tuple[1] == body['emoji']][0]
        try:
            if act == "post":
                post = UpPost.objects.get(pk=actId)
                old = React.objects.get(user=request.user, post=post)
            elif act == "comment":
                comment = Comment.objects.get(pk=actId)
                old = React.objects.get(user=request.user, comment=comment)
            else:
                return JsonResponse({"error":_("Action not justified. You can not react anything except post or comment.")}, status= 400)
        except ( UpPost.DoesNotExist, Comment.DoesNotExist ):
            return JsonResponse({"error":_("Post or comment may have deleted")}, status=404)
        if old.react_type != react_num:
            old.react_type = react_num
            old.save()
        return HttpResponse(status=201)

@login_required
def follow(request):
    owner = User.objects.get(pk=request.user.id)
    posts = [users.followed_post() for users in owner.follow.all()]
    posts = list(chain(*posts))
    paginator = Paginator(posts, 10)
    page_num = request.GET.get('page')
    page_obj = paginator.get_page(page_num)
    return render(request, "network/index.html", {"form":None, "comment":ProcComment(auto_id=False), "page_obj":page_obj, "availability":False})

@login_required
def toggle_follow(request, id):
    if request.method == "GET":
        return HttpResponse(status=405)
    if request.method == "POST":
        try:
            follow_obj = Follow.objects.get(user=request.user.id, followed=id)
        except Follow.DoesNotExist:
            try:
                to_follow = User.objects.get(pk=id)
            except User.DoesNotExist:
                return HttpResponse(status=404)
            else:
                new_follow_obj = Follow(user=request.user, followed = to_follow)
                new_follow_obj.save()
        else:
            follow_obj.delete()
        return HttpResponseRedirect(reverse("profile", args=[id]))
