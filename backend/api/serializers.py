from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from dj_rest_auth.serializers import LoginSerializer

# Use the project's configured User model (custom or Django's default)
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Converts User database records into JSON-friendly dicts for API responses.
    """

    # Inner "Meta" class — DRF convention for serializer configuration (not special Python syntax)
    class Meta:
        # Which Django model this serializer reads from
        model = User
        # Model fields included in the default API output
        fields = ("id", "email")

    def to_representation(self, instance):
        """
        Customize how a User is turned into a dict before it becomes JSON.
        Called automatically when DRF serializes a user for a response.
        """
        # Start with the default dict (id + email from Meta.fields)
        data = super().to_representation(instance)

        # Send id as a string so JSON clients don't need to handle integers
        data["id"] = str(data["id"])

        # Add a computed "name" field from first + last name when available
        full = instance.get_full_name().strip()
        if full:
            data["name"] = full

        return data


class CustomLoginSerializer(LoginSerializer):
    """
    Login input validation for POST /api/auth/login/.
    Extends dj-rest-auth defaults with clearers messages and normalized email.
    """

    email = serializers.EmailField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Enter a valid email address.",
        },
    )

    password = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
            "invalid": "Enter a valid password.",
        },
    )

    def validate(self, attrs):
        attrs["email"] = attrs.get("email", "").strip().lower()
        try:
            return super().validate(attrs)
        except ValidationError:
            # Replace dj-rest-auth's generic auth failure with your copy
            raise ValidationError("Incorrect email or password.")
