// {% if msg %}
//     alert("{{ msg }}")
// {% endif %}
function sign_in() {
    let username = $('#input-username').val();
    let password = $('#input-password').val();

    if (username === '') {
        $('#help-id-login').text('Please input your ID');
        $('#input-username').focus();
        return;
    } else {
        $('#help-id-login').text('');
    }

    if (password === '') {
        $('#help-password-login').text('Please input your password');
        $('#input-password').focus();
        return;
    } else {
        $('#help-password-login').text();
    }

    console.log(username, password);
    $.ajax({
        type: 'POST',
        url: '/sign_in',
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                // let token = response['token'];
                $.cookie('mytoken', response['token'], { path: '/' });

                alert("Login complete!");
                window.location.href = '/';
            } else {
                alert(response['msg']);
            }
        },
    });
}

function toggle_sign_up() {
    $('#sign-up-box').toggleClass('is-hidden');
    $('#div-sign-in-or-up').toggleClass('is-hidden');
    $('#btn-check-dup').toggleClass('is-hidden');
    $('#help-id').toggleClass('is-hidden');
    $('#help-password').toggleClass('is-hidden');
    $('#help-password2').toggleClass('is-hidden');
}

function is_nickname(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,10}$/;
    return regExp.test(asValue);
}

function is_password(asValue) {
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    return regExp.test(asValue);
}


function sign_up() {
    let inputPass = $('#input-password');
    let inputPass2 = $('#input-password2');

    let helpPass = $('#help-password');
    let helpPass2 = $('#help-password2');

    let username = $('#input-username').val();
    let password = inputPass.val();
    let password2 = inputPass2.val();

    // let helpId = $('#help-id');

    if ($('#help-id').hasClass('is-danger')) {
        alert('Please check your ID');
        return;
    } else if (!$('#help-id').hasClass('is-success')) {
        alert('Plase double check your ID');
        return;
    }


    if (password === '') {
        helpPass.text('Please enter your password')
            .removeClass('is-safe')
            .addClass('is-danger');
        inputPass.focus();
        return;
    } else if (!is_password(password)) {
        helpPass
            .text('Please check your password. For your password, please enter 8-20 English characters, numbers, or the following special characters (!@#$%^&*)')
            .removeClass('is-safe')
            .addClass('is-danger');
        inputPass.focus();
        return;
    } else {
        helpPass.text('This password can be used!')
            .removeClass('is-danger')
            .addClass('is-success');
    }

    if (password2 === '') {
        helpPass2
            .text('Please enter your password')
            .removeClass('is-safe')
            .addClass('is-danger');
        inputPass2.focus();

        return;
    } else if (password2 !== password) {
        helpPass2
            .text('Your passwords do not match')
            .removeClass('is-safe')
            .addClass('is-danger');
        inputPass2.focus();
        return;
    } else {
        helpPass2
            .text('Your passwords match!')
            .removeClass('is-danger')
            .addClass('is-success');
    }

    $.ajax({
        type: 'POST',
        url: '/sign_up/save',
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            alert("You are registered! Nice!");
            window.location.replace('/login');
        },
    });
}


// cek username duplikat
function check_dup() {
    let inputUsername = $('#input-username');
    let username = inputUsername.val();
    let helpID = $('#help-id');
    if (username === '') {
        helpID.text("Please enter your ID")
            .removeClass('is-safe')
            .addClass('is-danger');
        inputUsername.focus();
        return;
    }

    // mengecek username valid or not

    if (!is_nickname(username)) {
        helpID.text('Please check your ID. For your ID, please enter 2-10 English characters, numbers, or the following special characters (._-)')
            .removeClass('is-safe')
            .addClass('is-danger');
        inputUsername.focus();
        return;
    }
    
    helpID.addClass('is-loading');
    $.ajax({
        type: 'POST',
        url: '/sign_up/check_dup',
        data: {
            username_give: username,
        },
        success: function (response) {
            if (response['exists']) {
                helpID.text('This ID already in use')
                    .removeClass('is-safe')
                    .addClass('is-danger');
                inputUsername.focus();
            } else {
                helpID.text('This ID is available')
                    .removeClass('is-danger')
                    .addClass('is-success');
            }
            helpID.removeClass('is-loading');
        },
    });
}

// membersihan inputan yang user masukan

function clearInputs() {
    $('#input-username').val('');
    $('#input-password').val('');
    $('#input-password2').val('');

}

// 
function post() {
    let comment = $('#textarea-post').val();
    let today = new Date().toISOString();
    $.ajax({
        type: 'POST',
        url: '/posting',
        data: {
            comment_give: comment,
            date_give: today,
        },
        success: function (response) {
            $('#modal-post').removeClass('is-active');
            window.location.reload();
        },
    });
}

// untuk menghitung waktu pada setiap postingan
function time2str(date) {
    let today = new Date();
    let time = (today - date) / 1000 / 60;
    if (time < 60) {
        return parseInt(time) + 'minutes ago';
    }
    time = time / 60;
    if (time < 24) {
        return parseInt(time) + 'hours ago';
    }
    time = time / 24;
    if (time < 7) {
        return parseInt(time) + 'days ago';
    }
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

// POSTING
function get_posts(username) {
    if (username === undefined) {
        username = '';
    }
    $('#post-box').empty();
    $.ajax({
        type: 'GET',
        url: `/get_posts?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response['result'] === 'success') {
                let posts = response['posts'];
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i];
                    let time_post = new Date(post['date']);
                    let time_before = time2str(time_post);

                    let class_heart = post['heart_by_me'] ? 'fa-heart' : 'fa-heart-o';
                    let class_star = post['star_by_me'] ? 'fa-star' : 'fa-star-o';
                    let class_thumbs = post['thumbs_by_me'] ? 'fa-thumbs-up' : ' fa-thumbs-o-up';
                    let html_temp = `
                    <div class="box" id="${post['_id']}">
        <article class="media">
            <div class="media-left">
                <a href="/user/${post['username']}" class="image is-64x64">
                    <img class="is-rounded" src="/static/${post['profile_pic_real']}" alt="Image"/>
                </a>
            </div>
            <div class="media-content">
                <div class="content">
                    <p>
                        <strong>${post['profile_name']}</strong><small>@${post['username']}</small>
                        <small>${time_before}</small>
                        <br>
                        ${post['comment']}
                    </p>
                </div>
                <nav class="level is-mobile">
                    <div class="level-left">
                        <a href="#" class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post["_id"]}','heart')">
                        <span class="icon is-small">
                            <i class="fa ${class_heart}" area-hidden="true"></i>
                        </span>&nbsp;<span class="like-num">${num2str(post['count_heart'])}</span>
                    </a>
                    <a href="#" class="level-item is-sparta" aria-label="star" onclick="toggle_like('${post["_id"]}','star')">
                    <span class="icon is-small">
                        <i class="fa ${class_star}" area-hidden="true"></i>
                    </span>&nbsp;<span class="like-num">${num2str(post['count_star'])}</span>
                </a>
                <a href="#" class="level-item is-sparta" aria-label="thumbs-up" onclick="toggle_like('${post["_id"]}', 'thumbs-up')">
                <span class="icon is-small">
                    <i class="fa ${class_thumbs}" aria-hidden="true"></i>
                </span>&nbsp;<span class="like-num">${num2str(post['count_thumbs_up'])}</span>
            </a>
                    </div>
                </nav>
            </div>
        </article>
    </div>
                    `;
                    $('#post-box').append(html_temp);
                }
            }
        },
    });
}


// like function
function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + 'k'
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + 'k'
    }
    if (count == 0) {
        return '';
    }
    return count
}

// UPDATE LIKES
function toggle_like(post_id, type) {
    let $a_like = $(`#${post_id} a[aria-label='heart']`);
    let $i_like = $a_like.find('i');
    let $a_star = $(`#${post_id} a[aria-label='star']`);
    let $i_star = $a_star.find('i');
    let $a_thumbs = $(`#${post_id} a[aria-label='thumbs-up']`);
    let $i_thumbs = $a_thumbs.find('i');
    if (type === 'heart') {
        if ($i_like.hasClass('fa-heart')) {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'unlike',
                },
                success: function (response) {
                    $i_like.addClass('fa-heart-o').removeClass('fa-heart');
                    $a_like.find('span.like-num').text(num2str(response['count']));
                }
            })
        } else {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'like',
                },
                success: function (response) {
                    $i_like.addClass('fa-heart').removeClass('fa-heart-o');
                    $a_like.find('span.like-num').text(num2str(response['count']));
                }
            });
        }
    } else if (type === 'star') {
        if ($i_star.hasClass('fa-star')) {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'unlike',
                },
                success: function (response) {
                    $i_star.addClass('fa-star-o').removeClass('fa-star');
                    $a_star.find('span.like-num').text(num2str(response['count']));
                }
            })
        } else {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'like',
                },
                success: function (response) {
                    $i_star.addClass('fa-star').removeClass('fa-star-o');
                    $a_star.find('span.like-num').text(num2str(response['count']));
                }
            });
        }
    } else {
        if ($i_thumbs.hasClass('fa-thumbs-up')) {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'unlike',
                },
                success: function (response) {
                    $i_thumbs.addClass(' fa-thumbs-o-up').removeClass('fa-thumbs-up');
                    $a_thumbs.find('span.like-num').text(num2str(response['count']));
                }
            })
        } else {
            $.ajax({
                type: 'POST',
                url: '/update_like',
                data: {
                    post_id_give: post_id,
                    type_give: type,
                    action_give: 'like',
                },
                success: function (response) {
                    $i_thumbs.addClass('fa-thumbs-up').removeClass(' fa-thumbs-o-up');
                    $a_thumbs.find('span.like-num').text(num2str(response['count']));
                }
            });
        }
    }
}

  




// sign out
function sign_out() {
    $.removeCookie("mytoken", { path: "/" });
    alert("Signed out!");
    window.location.href = "/login";
}

//   EDIT PROFILE OR UPDATE
function update_profile() {
    let name = $("#input-name").val();
    let file = $("#input-pic")[0].files[0];
    let about = $("#textarea-about").val();
    let form_data = new FormData();
    form_data.append("file_give", file);
    form_data.append("name_give", name);
    form_data.append("about_give", about);
    console.log(name, file, about, form_data);

    $.ajax({
        type: "POST",
        url: "/update_profile",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response["result"] === "success") {
                alert(response["msg"]);
                window.location.reload();
            }
        },
    });
}