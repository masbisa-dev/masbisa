from django.contrib.auth import get_user_model
from rest_framework import serializers

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
