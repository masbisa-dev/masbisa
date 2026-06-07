from django.contrib.auth import get_user_model
from rest_framework import serializers

# use the project-configured model (default or custom)
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # DRF: exposes certain fields/methods of the User class
    class Meta:
        model = User
        fields = ("id", "email")

    # DRF: convert python obj into dict
    def to_representation(self, instance):
        """
        Customize how a User is turned into a dict before it becomes a JSON.
        Called automatically when DRF serializes a user for a response.
        """
        # Start with default dict (id + email from Meta.fields)
        data = super().to_representation(instance)
        # Send id as a string so JSON clients don't need to handle integers
        data["id"] = str(data["id"])
        # Add a computed "name" field from first + last name when available
        full = instance.get_full_name().strip()
        if full:
            data["name"] = full
        return data
