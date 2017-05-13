$(document).ready(function() {
		$("img.lazy").lazyload({
		    skip_invisible : true,
		    threshold : 200,
		    event : "forceLoadImg"
		});
		$(".display-canvas").on("show.bs.collapse", function() {
			var $canvasDisplay = $(this);
			var canvasId = $canvasDisplay.attr('data-canvasId');
			$canvasDisplay.find("img.lazy").trigger("forceLoadImg");
			$.get("/annotations/searchCanvasAnnotations/" + encodeURIComponent(canvasId), function(annotations) {
				var annotationsDisplay = $canvasDisplay.find(".annotations-data .panel-body");
				annotationsDisplay.empty();
				annotationsDisplay.parent().children(".panel-heading").find(">.panel-title > .badge").html(annotations.length);
				
				annotations.forEach(function(anno) {
					var annoId = anno.oaAnnotation['@id'];
					var annoDataUrl = "/annotations/displayAnno/" + encodeURIComponent(annoId) + "/annoInlinePreview";

					var $annoContentDiv = $("<div/>");
					annotationsDisplay.append($annoContentDiv);
					$.get(annoDataUrl, function(data) {
						$annoContentDiv.append(data);
						$annoContentDiv.find("img.lazy").lazyload({
						    skip_invisible : true,
						    threshold : 200
					    });
					});
				});
			});
		});
		$('.login-form').on('click', '.login-send', function(event) {
			var $this = $(this);
			var $form = $(event.delegateTarget)
			var username = $form.children("input.login-username").val();
			var password = $form.children("input.login-password").val();
			var settings = {
				"url": "/users/login",
				"method": "POST",
				"headers": {
					"content-type": "application/x-www-form-urlencoded",
				},
				"data": {
					"username": username,
					"password": password
				}
			}

			$.ajax(settings).done(function (response) {
				location.reload();
			}).fail(function(response) {
				$('.login-failed').show();
			});
		});
		$('.login-logout-send').on('click', function() {
			var settings = {
				url: "/users/logout",
				method: "GET"
			};
			$.ajax(settings).done(function (response) {
				location.reload();
			});
		});
		//show permissions Modal
/*		$('.permissions-show').on('click', function(event) {
			var href = $(event.delegateTarget);
			var entityId = href.data("entityid");
			console.debug(entityId);
			$.get("/admin/entityPermissions/" + encodeURIComponent(entityId), function (permissionsJson) {
				console.log(permissionsJson);
				permissionsModal
			});
		});
*/		
		$('#permissionsModal').on('show.bs.modal', function (event) {
			var button = $(event.relatedTarget);
			var entityId = button.data('entityid');
			console.debug(entityId);

			var $modal = $(this);
			console.debug($modal);
			$modal.find("#permissions-entityId").val(entityId);

			//clear the permissions list
			var $permissionsList = $modal.find('#permissions-list').empty();
			$modal.find('#permissions-entitytype').val("");
			$modal.find(".loader").show();

			$.get('/admin/entityPermissions/' + encodeURIComponent(entityId), function (permissions) {
				console.log(permissions);
				$modal.find(".loader").hide();
				$modal.find('#permissions-entitytype').val(permissions.json.resourceType);
				//iterate over the different permission types (groups & users)
				$permissionsList.append(permissions.html);
			});
		});

		//For development: Show the first canvas of the first manifest
		$('#accordion').children().first().children(".collapse").collapse("show").find(".display-canvas").first().collapse("show");

		/* install.ejs */
		// intersect submission of createAdminUser form 
		$('#installAdminUser > .newUserForm').validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {
				console.debug("invalid!");
			} else {
				e.preventDefault();
			
				var settings = {
					url: "/install/doInstall/1",
					method: "POST",
					data: $(this).serialize()
				};
				$.ajax(settings).done(function (response) {
					console.debug(response);
					//$("#installAdminUser").find("input,button").hide();
				});
			}
		});
	});